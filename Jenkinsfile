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
                sh 'npx playwright install --with-deps chromium'
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
