def nodeImage = 'node:18.18'
def sonarImage = 'sonarsource/sonar-scanner-cli'

def getCommitSha() {
  return sh(returnStdout: true, script: 'git rev-parse HEAD')
}

def getEnvName(branchName) {
    if("int".equals(branchName)) {
        return "int";
    } else if ("production".equals(branchName)) {
        return "prod";
    } else {
        return "dev";
    }
}



//def getCommitTag2() {
// return sh(returnStdout: true, script: 'git tag -l --sort=-committerdate | head -n1')
//}

//workd fine with int*
def getCommitTag2() {
return sh(returnStdout: true, script: 'git describe --match "INT*" --abbrev=0 --tags $(git rev-list --tags --max-count=1)')
 }


pipeline {
    agent { label 'rehl8-prod' }
    environment { npm_config_cache = 'npm-cache' }
    stages {
            
       stage('Set-Env') {
            agent { label 'rehl8-prod' }
              steps {
                   script {
                                   
                       def branchName = (env.GIT_BRANCH)
                       def githash_commit = (env.GIT_COMMIT)
                       echo "githash_commit: $githash_commit"
                                         
                    //   GIT_HASH_TAG22 = getCommitTag2()
                     //below works
                     env.GIT_HASH_TAG22 = getCommitTag2()
                     
                
                     
                     
                   //   echo "GIT_HASH_TAG22: $GIT_HASH_TAG22"
                     echo "GIT_HASH_TAG22: ${env.GIT_HASH_TAG22}"
                                                                                
                     }      
              
               }
         } 
      
     
        stage('Build') {
            agent {
                docker {
                    image "${nodeImage}"
                    args '--userns=keep-id -e HOME=/tmp/home --security-opt label=disable'
                    label 'rehl8-prod'
                }
            }

            steps {
                sh 'npm --version'
                sh 'npm i'
                sh 'npm run build:prod'
            }
    }
      

    stage('Publish') {
            agent { label 'rehl8-prod' }
            steps {
                script {
          sh '''
              echo ${GIT_HASH_TAG22}
              TagName=${GIT_HASH_TAG22//[[:space:]]/}
              echo $TagName
         
              mkdir -p builds/$GIT_COMMIT
              rm -f dist.tar
              tar cvf dist.tar dist/automation-ui/*
              rm -f dist.tar.gz
              gzip dist.tar
              mv dist.tar.gz builds/$GIT_COMMIT/dist-$TagName.tar.gz
              if (findmnt -T /mnt/buildartifacts)
             then mkdir -p /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && cp builds/$GIT_COMMIT/dist-$TagName.tar.gz  /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && chmod -R 755 /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT
             else echo 'NFS Mount not available'; exit 1
             fi
        
          '''
                }
            }
     }
      

      

    }
}
