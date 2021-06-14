def nodeImage = 'node:16.3.0'
def sonarImage = 'sonarsource/sonar-scanner-cli'

pipeline {
  agent any

  environment {
    npm_config_cache = 'npm-cache'
  }

  stages {
    stage ('Artifactory Configuration') {
      steps {
        rtServer(
          id: "artifactory_dev",
          url: "http://10.151.14.53/artifactory",
          credentialsId: "artifactory"
        )
        rtNpmResolver(
          id: "NPM_RESOLVER",
          serverId: "artifactory_dev",
          repo: "draas-npm-dev-virtual"
        )
        rtNpmDeployer(
          id: "NPM_DEPLOYER",
          serverId: "artifactory_dev",
          repo: "draas-npm-dev-virtual"
        )
      }
    }
    stage('Build') {
      steps {
        script {
          docker.image("${nodeImage}").inside("--user node") {
            sh 'npm config set registry http://10.151.14.53/artifactory/api/npm/npm-remote/'
            sh 'npm i'
            sh 'npm run build:prod'
          }
        }
      }
    }

    stage('Tests') {
      steps {
        script {
          docker.image("${nodeImage}").inside("--user node") {
            sh 'npm run test:ci'
          }
        }
      }
    }

    stage("SonarQube - Static Analysis") {
      steps {
        withSonarQubeEnv('dc01') {
          script {
            def readContent = readFile "sonar-project.properties"
            writeFile file: "sonar-project.properties", text: "$readContent \nsonar.branch.name=$BRANCH_NAME\n"
            docker.image("${sonarImage}").withRun('-u 1000:993 -v "$PWD:/usr/src"') { c ->
              sh 'while [ ! -f ./.scannerwork/report-task.txt ]; do sleep 5; done'
            }
          }
        }
      }
    }
    stage ('Publish') {
      steps {
        script {
          sh 'mkdir -p builds/$GIT_COMMIT'
          sh 'rm -f dist.tar'
          sh 'tar cvf dist.tar dist/automation-ui/*'
          sh 'rm -f dist.tar.gz'
          sh 'gzip dist.tar'
          sh 'mv dist.tar.gz builds/$GIT_COMMIT/dist.tar.gz'
          rtUpload (
            serverId: 'artifactory_dev',
            spec: '''{
                "files": [
                  {
                    "pattern": "builds/$GIT_COMMIT/dist.tar.gz",
                    "target": "dcs-ui",
                    "recursive": "true",
                    "flat" : "false"
                  }
                ]}'''
          )

          rtPublishBuildInfo ( serverId: "artifactory_dev" )
        }
      }
    }
  }

  post {
    always {
      sh 'cp coverage/cobertura-coverage.xml cobertura-coverage.xml'
      cobertura(coberturaReportFile: 'cobertura-coverage.xml')
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}
