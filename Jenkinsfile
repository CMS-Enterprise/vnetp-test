def nodeImage = 'node:16.3.0'
def sonarImage = 'sonarsource/sonar-scanner-cli'

pipeline {
  agent { label 'prod' }
  environment { npm_config_cache = 'npm-cache' }
  stages {
    stage ('Artifactory Configuration') {
      steps {
        rtServer(
          id: "artifactory_dev",
          url: "http://10.151.14.53/artifactory",
          credentialsId: "svccicdartifactory"
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
      agent {
        docker {
          image "${nodeImage}"
          args '-u node'
          args '-e HOME=/tmp/home'
          reuseNode true
        }
      }
      steps {
        sh 'npm --version'
        sh 'npm i'
        sh 'npm run build:prod'
      }
    }
    stage('Tests') {
      agent {
        docker {
          image "${nodeImage}"
          args '-u node'
          args '-e HOME=/tmp/home'
          reuseNode true
        }
      }
      steps {
        sh 'npm --version'
        sh 'npm run test:ci'
      }
    }
    stage("SonarQube - Static Analysis") {
      steps {
        withSonarQubeEnv('CB2Sonar') {
          script {
            def readContent = readFile "sonar-project.properties"
            writeFile file: "sonar-project.properties", text: "$readContent \nsonar.branch.name=$BRANCH_NAME\n"
            docker.image("${sonarImage}").withRun('-u 0:993 -v "$PWD:/usr/src"') { c ->
            
            // NEED THIS LINE TO WORK!
            // sh 'if [ -d ./.scannerwork ]; then rm -Rf ./.scannerwork; fi'
            sh 'while [ ! -f ./.scannerwork/report-task.txt ]; do sleep 5; done'
            }
          }
        }
      }
    }
    stage('Publish') {
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
