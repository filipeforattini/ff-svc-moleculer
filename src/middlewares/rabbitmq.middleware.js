const _ = require("lodash");
const amqplib = require("amqplib");

const decoupleNames = (eventName) => {
  const queue = eventName.replace("amqp://", "");
  const names = queue.split(".");

  if (names.length <= 1)
    return {
      exchange: eventName,
      routingKey: "",
    };

  const routingKey = names.pop();

  return {
    exchange: names.join(),
    routingKey,
    queue,
  };
};

const addConnectionEvents = (connection, logger) => {
  connection
    .on("error", (err) => {
      logger.error("AMQP connection error.", err);
    })
    .on("close", (err) => {
      logger.error("AMQP connection is closed.", err);
    })
    .on("blocked", (reason) => {
      logger.warn("AMQP connection is blocked.", reason);
    })
    .on("unblocked", () => {
      logger.info("AMQP connection is unblocked.");
    });
};

const addChannelEvents = (channel, logger) => {
  channel
    .on("close", () => {
      logger.error("AMQP channel closed.");
    })
    .on("error", (err) => {
      logger.error("AMQP channel error", err);
    })
    .on("drain", () => {
      logger.info("AMQP channel is drained.");
    })
    .on("return", (msg) => {
      logger.warn("AMQP channel returned a message.", msg);
    });
};

const connectionLoop = ({ uri, logger = console, maxTries = 10} = {}) => {
  return new Promise(async (resolve, reject) => {
    let tries = 1
    let connection = null
    const connect = () => amqplib.connect(uri)

    const loop = setInterval(async () => {
      try {
        logger.info(`trying to connect into AMQP (${tries}/${maxTries})`);
        connection = await connect()
        clearInterval(loop)
        resolve(connection)
      } catch (error) {
        logger.error(error)
      }

      tries++
      if (tries > maxTries) {
        clearInterval(loop)
        reject(new Error('reached the maximum of retries'))
      }
    }, 2*1000);
  })
}

module.exports = (options = {}) => {
  let myBroker = null;
  
  const { 
    autoAck = true, 
    uri = "amqp://localhost", 
    prefetch = 3 
  } = options;

  return {
    async starting (broker) {
      myBroker = broker;

      if (broker.amqpConnection) {
        await broker.amqpConnection
      } else {
        this.logger.info("Connecting to AMQP server...");
        broker.amqpConnection = await connectionLoop({ uri, logger: this.logger });
  
        addConnectionEvents(broker.amqpConnection, this.logger);
        this.logger.info("AMQP is connected.");
      }

      this.logger.debug(`Creating AMQP channel...`);
      broker.amqpChannel = await broker.amqpConnection.createChannel();

      addChannelEvents(broker.amqpChannel, this.logger);
      broker.amqpChannel.prefetch(prefetch);

      broker.sendToQueue = (queue, content) => {
        const { exchange, routingKey } = decoupleNames(queue);
        content = Buffer.from(JSON.stringify(content), "utf-8");

        myBroker.amqpChannel.assertExchange(exchange, "fanout", {
          durable: true,
        });

        myBroker.amqpChannel.publish(exchange, routingKey, content);
      };
    },

    async serviceStarted (service) {
      if (myBroker.amqpConnection) await myBroker.amqpConnection
      
      const amqpEvents = Object.keys(service.events).filter((event) => event.startsWith("amqp://"));

      if (amqpEvents.length === 0) return service;

      this.logger.warn(`service ${service.name.toUpperCase()} has AMQP events`);

      // create exchanges
      await Promise.all(
        amqpEvents
          .map((event) => {
            const {exchange} = decoupleNames(event)
            this.logger.info(`exchange found [${exchange}] from [${event}]!`)
            return exchange
          })
          .map((exchange) => myBroker.amqpChannel.assertExchange(exchange, "fanout"))
      );

      // create queues
      amqpEvents.forEach(async (event) => {
        const { exchange, routingKey, queue } = decoupleNames(event);

        await myBroker.amqpChannel.assertQueue(queue, {
          autoDelete: true,
          durable: false,
        });
        await myBroker.amqpChannel.bindQueue(queue, exchange, routingKey);

        if (autoAck) {
          // emits as an event and acknowledges
          myBroker.amqpChannel.consume(queue, async (payload) => {
            const { content } = payload;
            await myBroker.emit(event, JSON.parse(content));
            myBroker.amqpChannel.ack(payload);
          });
        } else {
          // use the event function as consumer callback
          myBroker.amqpChannel.consume(queue, service.events[event]);
        }
      });

      // return new schema
      return service;
    },
  };
};
