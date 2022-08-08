make: mount up dependencies

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

K8S_REPOSITORY ?= ff-svc-moleculer
K8S_NAMESPACE ?= ff-svc-moleculer-dev
DIR_MANIFESTS ?= ./manifests
FILE_DEPENDENCIES_RENDERED ?= $(DIR_MANIFESTS)/local/dependencies.rendered.yml

DIR_PIPELINE ?= ../ff-iac-github-actions
DIR_K8S_TOOLS ?= $(DIR_PIPELINE)/deploy/as-k8s
DEPENDENCIES_INSTALLER ?= $(DIR_PIPELINE)/src/dependency-install.sh

up:
	kubectl apply -f $(ROOT_DIR)/manifests/local/kubefile.yml
	minikube service local-svc -n ff-svc-moleculer-dev --url
	minikube service local-rabbitmq -n ff-svc-moleculer-dev --url

mount:
	minikube mount $(ROOT_DIR):/app &

dependencies: dependencies-generate dependencies-create

dependencies-generate:
	ytt \
		-f $(DIR_K8S_TOOLS)/dependencies.schema.yml \
		-f $(DIR_K8S_TOOLS)/dependencies.yml \
		-f $(DIR_MANIFESTS)/local/dependencies.yml \
		--data-value repository=$(K8S_NAMESPACE) \
			> $(FILE_DEPENDENCIES_RENDERED)

dependencies-create: mysql postgres rabbitmq redis nats etcd

mysql:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=mysql \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)

postgres:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=postgres \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)

rabbitmq:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=rabbitmq \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)

redis:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=redis \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)

nats:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=nats \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)

etcd:
	K8S_NAMESPACE=$(K8S_NAMESPACE) \
	K8S_REPOSITORY=$(K8S_REPOSITORY) \
	DEPENDENCY_NAME=etcd \
	DEPENDENCY_FILE=$(FILE_DEPENDENCIES_RENDERED) \
		$(DEPENDENCIES_INSTALLER)
