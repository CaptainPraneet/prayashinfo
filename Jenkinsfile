
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_PREFIX = 'ghcr.io/captainpraneet/prayashcare'
        K8S_NAMESPACE = 'prayashcare'
    }

    parameters {
        string(
            name: 'VITE_BACKEND_URL',
            defaultValue: 'https://prayashinfo.onrender.com/',
            description: 'Backend API URL'
        )

        string(
            name: 'VITE_RAZORPAY_KEY_ID',
            defaultValue: '',
            description: 'Public Razorpay Key ID'
        )
    }

    stages {

        // STAGE 1: CHECKOUT
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checkout successful'
            }
        }

        // STAGE 2: BUILD DOCKER IMAGES
        stage('Build Docker Images') {
            steps {
                script {
                    if (!params.VITE_BACKEND_URL?.trim()) {
                        error('Backend URL is required')
                    }

                    if (env.GIT_BRANCH == 'origin/main' &&
                        !params.VITE_BACKEND_URL.startsWith('https://')) {
                        error('Production backend URL must use HTTPS')
                    }

                    env.IMAGE_TAG =
                        "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"

                    echo "Building images with tag: ${env.IMAGE_TAG}"
                }

                sh '''
                    set -eu

                    docker build --pull \
                        --build-arg VITE_BACKEND_URL="$VITE_BACKEND_URL" \
                        --build-arg VITE_RAZORPAY_KEY_ID="$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/frontend:$IMAGE_TAG" ./frontend

                    docker build --pull \
                        --build-arg VITE_BACKEND_URL="$VITE_BACKEND_URL" \
                        --build-arg VITE_RAZORPAY_KEY_ID="$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/admin:$IMAGE_TAG" ./admin

                    docker build --pull \
                        -t "$IMAGE_PREFIX/backend:$IMAGE_TAG" ./backend
                '''
            }
        }

        // STAGE 3: LOGIN AND PUSH TO GHCR
        stage('Push Images to GHCR') {
            when {
                expression {
                    env.GIT_BRANCH == 'origin/main' ||
                    env.BRANCH_NAME == 'main'
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'appointy-container-registry',
                        usernameVariable: 'REGISTRY_USERNAME',
                        passwordVariable: 'REGISTRY_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu

                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        echo "$REGISTRY_PASSWORD" | docker login "$DOCKER_REGISTRY" \
                            --username "$REGISTRY_USERNAME" \
                            --password-stdin

                        echo "Docker login successful"

                        docker push "$IMAGE_PREFIX/frontend:$IMAGE_TAG"
                        docker push "$IMAGE_PREFIX/admin:$IMAGE_TAG"
                        docker push "$IMAGE_PREFIX/backend:$IMAGE_TAG"

                        echo "All images pushed successfully"
                    '''
                }
            }
        }

        // STAGE 4: DEPLOY TO KUBERNETES
        stage('Deploy to Kubernetes') {
            when {
                expression {
                    env.GIT_BRANCH == 'origin/main' ||
                    env.BRANCH_NAME == 'main'
                }
            }

            steps {
                withCredentials([
                    file(
                        credentialsId: 'appointy-kubeconfig',
                        variable: 'KUBECONFIG'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "Checking Kubernetes connection"
                        kubectl get nodes

                        echo "Creating namespace"
                        kubectl apply -f k8s/00-namespace.yaml

                        echo "Deploying PrayashCare workloads"

                        sed \
                            -e "s|__IMAGE_PREFIX__|$IMAGE_PREFIX|g" \
                            -e "s|__IMAGE_TAG__|$IMAGE_TAG|g" \
                            k8s/10-workloads.yaml | kubectl apply -f -

                        echo "Waiting for frontend deployment"
                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-frontend --timeout=180s

                        echo "Waiting for admin deployment"
                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-admin --timeout=180s

                        echo "Waiting for backend deployment"
                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-backend --timeout=180s

                        echo "Kubernetes deployment successful"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'PrayashCare CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'PrayashCare CI/CD Pipeline failed. Check Console Output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
