pipeline {
    agent {
        label 'agent any'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_PREFIX = 'ghcr.io/your-github-owner/prayashcare'
        K8S_NAMESPACE = 'prayashcare'
    }

    parameters {
        string(
            name: 'VITE_BACKEND_URL',
            defaultValue: '',
            description: 'Public HTTPS URL for the backend API, e.g. https://api.example.com'
        )
        string(
            name: 'VITE_RAZORPAY_KEY_ID',
            defaultValue: '',
            description: 'Public Razorpay key ID used by the Vite portals (not the secret key)'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker images') {
            steps {
                script {
                    if (!params.VITE_BACKEND_URL?.trim()) {
                        error('Set the VITE_BACKEND_URL build parameter to the public API URL.')
                    }
                    if (env.BRANCH_NAME == 'main' && !params.VITE_BACKEND_URL.startsWith('https://')) {
                        error('Production VITE_BACKEND_URL must use HTTPS.')
                    }

                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
                }

                sh '''
                    set -eu

                    docker build --pull \
                        --build-arg "VITE_BACKEND_URL=$VITE_BACKEND_URL" \
                        --build-arg "VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/frontend:$IMAGE_TAG" ./frontend

                    docker build --pull \
                        --build-arg "VITE_BACKEND_URL=$VITE_BACKEND_URL" \
                        --build-arg "VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/admin:$IMAGE_TAG" ./admin

                    docker build --pull \
                        -t "$IMAGE_PREFIX/backend:$IMAGE_TAG" ./backend
                '''
            }
        }

        stage('Push images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    if (env.IMAGE_PREFIX.contains('your-github-owner')) {
                        error('Update IMAGE_PREFIX in Jenkinsfile to your container registry namespace.')
                    }
                }

                withCredentials([usernamePassword(
                    credentialsId: 'appointy-container-registry',
                    usernameVariable: 'REGISTRY_USERNAME',
                    passwordVariable: 'REGISTRY_PASSWORD'
                )]) {
                    sh '''
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        echo "$REGISTRY_PASSWORD" | docker login "$DOCKER_REGISTRY" \
                            --username "$REGISTRY_USERNAME" --password-stdin

                        for app in frontend admin backend; do
                            docker push "$IMAGE_PREFIX/$app:$IMAGE_TAG"
                        done
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([file(
                    credentialsId: 'appointy-kubeconfig',
                    variable: 'KUBECONFIG'
                )]) {
                    sh '''
                        set -eu

                        kubectl apply -f k8s/00-namespace.yaml
                        sed \
                            -e "s|__IMAGE_PREFIX__|$IMAGE_PREFIX|g" \
                            -e "s|__IMAGE_TAG__|$IMAGE_TAG|g" \
                            k8s/10-workloads.yaml | kubectl apply -f -

                        kubectl --namespace "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-frontend --timeout=180s
                        kubectl --namespace "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-admin --timeout=180s
                        kubectl --namespace "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-backend --timeout=180s
                    '''
                }
            }
        }
    }

}
