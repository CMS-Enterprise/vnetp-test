pipeline {
  agent any
  stages {
    stage('test') {
      steps {
        script{
          docker.image('zenika/alpine-chrome:with-node').inside("-u 0:0") {
            sh 'npm i --unsafe-perm'
            sh 'npm rebuild node-sass'
            sh 'npm run coverage'
            sh 'npm run test:jest-junit:ci'
          }
        }
      }
    }
  }
  post {
    always {
      junit 'jest-junit.xml'
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}

