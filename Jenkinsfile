#!groovy
@Library('github.com/cloudogu/ces-build-lib@1.43.0')
import com.cloudogu.ces.cesbuildlib.*

node('docker') {

    properties([
            // Keep only the last 10 build to preserve space
            buildDiscarder(logRotator(numToKeepStr: '10')),
            // Don't run concurrent builds for a branch, because they use the same workspace directory
            disableConcurrentBuilds(),
    ])

    Docker docker = new Docker(this)
    Git git = new Git(this)

    catchError {

        stage('Checkout') {
            checkout scm
            git.clean('')
            // Otherwise git.isTag() will not be reliable. Jenkins seems to do a sparse checkout only
            sh "git fetch --tags"
        }

        def image
        String imageName = "cloudogu/hello-k8s:${readVersion()}"

        stage('Build Images') {
            image = docker.build imageName, '.'
        }

        stage('Deploy Images') {
            docker.withRegistry('', 'cesmarvin-dockerhub-access-token') {
                //if (git.isTag()) {
                if (env.BRANCH_NAME == "master") {
                    image.push()
                    image.push('latest')
                }
            }
        }
    }

    mailIfStatusChanged(git.commitAuthorEmail)
}

String readVersion() {
    return sh (script: 'grep version app/package.json | sed \'s/"version": "\\(.*\\)".*/\\1/\'',
        returnStdout: true,
        label: 'readVersion').trim()
}
