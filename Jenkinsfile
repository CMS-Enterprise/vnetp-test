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
          }
        }
      }
    }
  }
  post {
    always {
      junit 'src/*.xml'
      // permissions problem from root ownership apparently [jvf]
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}