pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        PLAYWRIGHT_BROWSERS_PATH = '0'
        TEST_CASE_KEY = 'WFMD-T19429'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh '''
                    # Install system dependencies required by Playwright Chromium
                    apt-get update && apt-get install -y \
                        libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
                        libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
                        libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
                        libcairo2 libasound2 libatspi2.0-0 libxshmfence1 \
                        || true
                '''
                sh 'npx playwright install chromium'
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'npx playwright test --reporter=list,html,junit'
            }
            post {
                always {
                    junit testResults: 'test-results/results.xml', allowEmptyResults: true
                }
            }
        }
    }

    post {
        always {
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright E2E Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
        success {
            echo "All E2E tests passed for ${TEST_CASE_KEY}"
        }
        failure {
            echo "E2E tests failed for ${TEST_CASE_KEY}"
        }
        cleanup {
            cleanWs()
        }
    }
}
