
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
            description: 'Public HTTPS backend API URL'
        )

        string(
            name: 'VITE_RAZORPAY_KEY_ID',
            defaultValue: '',
            description: 'Public Razorpay Key ID'
        )
    }

    stages {

        // 1. CHECKOUT SOURCE CODE
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''

                    env.IS_MAIN_BRANCH =
                        (branch == 'main' || branch.endsWith('/main'))
                        ? 'true' : 'false'

                    echo "Git branch: ${branch}"
                    echo "Main branch: ${env.IS_MAIN_BRANCH}"
                }
            }
        }

        // 2. VALIDATE CONFIGURATION
        stage('Validate Configuration') {
            steps {
                script {
                    if (!params.VITE_BACKEND_URL?.trim()) {
                        error('VITE_BACKEND_URL is required')
                    }

                    if (env.IS_MAIN_BRANCH == 'true' &&
                        !params.VITE_BACKEND_URL.startsWith('https://')) {
                        error('Production backend URL must use HTTPS')
                    }

                    if (!env.GIT_COMMIT) {
                        error('Git commit information is missing')
                    }

                    env.IMAGE_TAG =
                        "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"

                    echo "Image prefix: ${env.IMAGE_PREFIX}"
                    echo "Image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        // 3. CHECK DOCKER
        stage('Docker Environment Check') {
            steps {
                sh '''
                    set -eu

                    docker --version
                    docker info
                '''
            }
        }

        // 4. BUILD FRONTEND, ADMIN AND BACKEND
        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    echo "Building Frontend image"

                    docker build --pull \
                        --build-arg VITE_BACKEND_URL="$VITE_BACKEND_URL" \
                        --build-arg VITE_RAZORPAY_KEY_ID="$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/frontend:$IMAGE_TAG" \
                        ./frontend

                    echo "Building Admin image"

                    docker build --pull \
                        --build-arg VITE_BACKEND_URL="$VITE_BACKEND_URL" \
                        --build-arg VITE_RAZORPAY_KEY_ID="$VITE_RAZORPAY_KEY_ID" \
                        -t "$IMAGE_PREFIX/admin:$IMAGE_TAG" \
                        ./admin

                    echo "Building Backend image"

                    docker build --pull \
                        -t "$IMAGE_PREFIX/backend:$IMAGE_TAG" \
                        ./backend

                    echo "All Docker images built successfully"
                '''
            }
        }

        // 5. TEST BUILT IMAGES
        stage('Verify Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker image inspect "$IMAGE_PREFIX/frontend:$IMAGE_TAG"
                    docker image inspect "$IMAGE_PREFIX/admin:$IMAGE_TAG"
                    docker image inspect "$IMAGE_PREFIX/backend:$IMAGE_TAG"

                    echo "All images verified successfully"
                '''
            }
        }

        // 6. LOGIN TO GITHUB CONTAINER REGISTRY
        stage('Docker Login to GHCR') {
            when {
                expression {
                    env.IS_MAIN_BRANCH == 'true'
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
                        set +x
                        set -eu

                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'docker logout "$DOCKER_REGISTRY" >/dev/null 2>&1 || true; rm -rf "$DOCKER_CONFIG"' EXIT

                        printf '%s' "$REGISTRY_PASSWORD" |
                            docker login "$DOCKER_REGISTRY" \
                            --username "$REGISTRY_USERNAME" \
                            --password-stdin

                        echo "GHCR login successful"
                    '''
                }
            }
        }

        // 7. PUSH IMAGES TO GHCR
        stage('Push Images to GHCR') {
            when {
                expression {
                    env.IS_MAIN_BRANCH == 'true'
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
                        set +x
                        set -eu

                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'docker logout "$DOCKER_REGISTRY" >/dev/null 2>&1 || true; rm -rf "$DOCKER_CONFIG"' EXIT

                        printf '%s' "$REGISTRY_PASSWORD" |
                            docker login "$DOCKER_REGISTRY" \
                            --username "$REGISTRY_USERNAME" \
                            --password-stdin

                        docker push "$IMAGE_PREFIX/frontend:$IMAGE_TAG"
                        docker push "$IMAGE_PREFIX/admin:$IMAGE_TAG"
                        docker push "$IMAGE_PREFIX/backend:$IMAGE_TAG"

                        echo "All images pushed to GHCR successfully"
                    '''
                }
            }
        }

        // 8. DEPLOY TO KUBERNETES
        stage('Deploy to Kubernetes') {
            when {
                expression {
                    env.IS_MAIN_BRANCH == 'true'
                }
            }

            steps {
                withCredentials([
                    file(
                        credentialsId: 'appointy-kubeconfig',
                        variable: 'KUBECONFIG'
                    ),

                    usernamePassword(
                        credentialsId: 'appointy-container-registry',
                        usernameVariable: 'REGISTRY_USERNAME',
                        passwordVariable: 'REGISTRY_PASSWORD'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        echo "Checking Kubernetes connection"

                        kubectl get nodes

                        echo "Creating Kubernetes namespace"

                        kubectl apply -f k8s/00-namespace.yaml

                        echo "Configuring private GHCR image access"

                        kubectl -n "$K8S_NAMESPACE" create secret docker-registry ghcr-secret \
                            --docker-server="$DOCKER_REGISTRY" \
                            --docker-username="$REGISTRY_USERNAME" \
                            --docker-password="$REGISTRY_PASSWORD" \
                            --dry-run=client -o yaml | kubectl apply -f -

                        kubectl -n "$K8S_NAMESPACE" patch serviceaccount default \
                            -p '{"imagePullSecrets":[{"name":"ghcr-secret"}]}'

                        echo "Deploying application manifests"

                        sed \
                            -e "s|__IMAGE_PREFIX__|$IMAGE_PREFIX|g" \
                            -e "s|__IMAGE_TAG__|$IMAGE_TAG|g" \
                            k8s/10-workloads.yaml | kubectl apply -f -

                        echo "Waiting for frontend rollout"

                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-frontend --timeout=180s

                        echo "Waiting for admin rollout"

                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-admin --timeout=180s

                        echo "Waiting for backend rollout"

                        kubectl -n "$K8S_NAMESPACE" rollout status \
                            deployment/prayashcare-backend --timeout=180s

                        echo "Kubernetes deployment successful"
                    '''
                }
            }
        }

        // 9. VERIFY DEPLOYMENT
        stage('Verify Deployment') {
            when {
                expression {
                    env.IS_MAIN_BRANCH == 'true'
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

                        echo "Checking deployed pods"

                        kubectl -n "$K8S_NAMESPACE" get pods

                        echo "Checking deployments"

                        kubectl -n "$K8S_NAMESPACE" get deployments

                        echo "Checking services"

                        kubectl -n "$K8S_NAMESPACE" get services

                        echo "PrayashCare deployment verification completed"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: PrayashCare CI/CD Pipeline completed!'
            echo 'Docker build, GHCR push and Kubernetes deployment finished.'
        }

        failure {
            echo 'FAILED: PrayashCare CI/CD Pipeline failed.'
            echo 'Please check Jenkins Console Output.'
        }

        always {
            echo 'PrayashCare CI/CD Pipeline execution finished.'
        }
    }
}
