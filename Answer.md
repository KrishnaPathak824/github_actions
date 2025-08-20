# CI-CD July 2 Assignment

[Github Repo for the Assignment](https://github.com/KrishnaPathak824/github_actions)

## Branching Strategy:

- **Main Branch**: This is the production branch. All code that is stable and ready for deployment should be merged into this branch.

- **Development Branch**: This branch is used for ongoing development. Features and fixes are merged into this branch before they are ready for production.

- **Feature Branches** : Each new feature or fixes are developed in its own branch isolated and later merged into dev branch.

1. Configure **two separate self-hosted runners**:

- One dedicated to building the backend.
- One dedicated to building the frontend.

**Answer:**

[Adding New self-hosted Runner setup](https://github.com/KrishnaPathak824/github_actions/settings/actions/runners/new?)

1. **_Created two new self hosted runner in my VM._**

- One `frontend-runner` for frontend and `backend-runner` for backend

- Downloaded the runner and extracted it.

![alt text](materials/image-2.png)

- Configured the runner by running the `config.sh` script in the extracted folder.

![alt text](materials/image-3.png)

- Used `./run.sh` to start the runner in the terminal.

![alt text](materials/image-4.png)

- Similarly, configured the `backend-runner` in the same way by copying the zipped file for configuration to the backend folder from the `frontend-runner` and running the `config.sh` script.

![alt text](materials/image-5.png)

![alt text](materials/image-6.png)

- The workflow ran on the self-hosted runner for the frontend and backend.

- Created changes on a feature branch `feature/testfeature` and pushed the changes and created a pull request to the `dev` branch.

![alt text](materials/image-7.png)

![alt text](materials/imagee.png)

### Tested the self-hosted runners:

- A PR check workflow was ran when a pull request was made to the `dev` branch.

![alt text](materials/image-1.png)

- The PR check workflow ran successfully.

- The pr was fetched in terminal to create a new branch using `git fetch origin pull` and it was merged to the `dev` branch.

![alt text](materials/image-8.png)

- The push workflows on dev branch were running on the self-hosted runner.

![alt text](materials/image-10.png)

**Error message: Docker was trying to use IPv6, but my network didn't support outbound IPv6.**

![alt text](materials/image-11.png)

- So ipv6 was disabled from the /etc/docker/daemon.json file and the docker service was restarted.

![alt text](materials/image-12.png)

![alt text](materials/image-13.png)

- The frontend runner ran successfully for the frontend jobs and the backend runner ran successfully for the backend jobs. The logs were seen in the terminal.

![alt text](materials/image-14.png)

![alt text](materials/image-17.png)

![alt text](materials/image-15.png)

![alt text](materials/image-16.png)

2. **_The self-hosted runners were configured as a service._**

[Configuring the self-hosted runner application as a service](https://docs.github.com/en/actions/how-tos/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service)

- `./svc.sh` was installed to run the self-hosted runner as a service. The service was exiting immediately after starting.

![alt text](materials/image-22.png)

- `sudo setenforce 0` was used to disable SELinux and the `./svc.sh` was run again using `sudo ./svc.sh start` to run the self-hosted runner as a service. The service ran successfully.

![alt text](materials/image-23.png)

- The both self-hosted runners were configured as a service.

---

## Worrkflow Structure:

### Workflow Files:

The workflow files are structured as follows:

```
.github/
└── workflows/
    ├── build.yaml
    ├── pr-check.yaml
    ├── prod.yaml
    ├── release-dev.yaml
    └── release-main.yaml
```

- Added action secrets for dockerhub and also personal access token.

![alt text](materials/image-18.png)

![alt text](materials/image-19.png)

- **_First the pr-check workflow is triggered when a pull request is made to the `dev` branch._**

- **_Then the release-dev workflow is triggered when the changes are merged to the `dev` branch which creates a pre release for the project._**

- **_When the release-dev workflow is successful the build workflow is triggered which builds the frontend and backend docker images and pushes them to the docker registry of the dev environment._**

- **_Finally, the release-main workflow is triggered when the changes are merged to the `main` branch which on success runs the prod workflow and creates a release for the project._**

**Selective Workflow Triggers**

- Workflows must **only trigger** when changes occur in their respective directories (`frontend/` or `backend/`).
- Changes to non-code files (e.g., `README.md`) must **not trigger any builds**.

**_Answer:_**

```yaml
paths-filter:
  runs-on: [frontend]
  outputs:
    backend1: ${{ steps.filter.outputs.backend1 }}
    backend2: ${{ steps.filter.outputs.backend2 }}
    frontend: ${{ steps.filter.outputs.frontend }}

  steps:
    - name: Checkout the repo
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: Detect changed files
      id: filter
      uses: dorny/paths-filter@v3
      with:
        filters: |
          backend1:
            - 'backend1/**'
          backend2:
            - 'backend2/**'
          frontend:
            - 'frontend/**'
```

- The paths-filter workflow was created to detect changes in the `backend1`, `backend2`, and `frontend` directories and the outputs were used to trigger workflows when changes occured in those directories.

- When no changes were made in the `backend1`, `backend2`, and `frontend` directories, the workflow were skipped.

![alt text](materials/image-32.png)

- When changes were made in the `backend1` directory, the workflow was triggered for the `backend1` directory.

![alt text](materials/image-37.png)

![alt text](materials/image-38.png)

- **_There was a issue with the path-filter workflow when workflow_runs was used to trigger the workflow as it doesnt support the paths-filter action as it doesnt automatically know the changes made in the previous workflow._**

- Changes to readme.md file were not triggered by using paths-ignore.

```yaml
paths-ignore:
  - "**.md"
  - "**.json"
```

---

### Semantic Versioning:

![Workflow for Semantic Versioning](code/release-dev.yaml)
![Workflow for Semantic Versioning](code/release-main.yaml)

- The semantic versioning was used to create a pre-release for the project when the changes were merged to the `dev` branch and a release for the project when the changes were merged to the `main` branch.

- The npm package `semantic-release` was used to automate which versions are released based on the commit messages.

```
module.exports = {
  branches: [
    { name: "main" },
    {
      name: "dev",
      channel: "dev",
      prerelease: "beta",
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
    "@semantic-release/github",
  ],
};
```

- The `release-dev.yaml` workflow was created to create a pre-release for the project when the changes were merged to the `dev` branch

- The `release-main.yaml` workflow was created to create a release for the project when the changes were merged to the `main` branch.

```yaml
- name: Semantic Release
  env:
    GITHUB_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
  run: npx semantic-release
```

The permissions were given to create the tags and releases in the github repository.

```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
```

## Build and Deployment

### Backend:

- Build the backend application implementing caching.

**_Answer:_**

- There exists two backend applications `backend1` and `backend2`.

### Dev Environment:

[Workflow for Dev Environment](code/build.yaml)

- In the build workflow file `build.yaml`, the backend was used to fetch the latest tag which would be the latest pre-release version of the application.

```yaml
- name: Get latest tag
  id: get_tag
  run: |
    git fetch --tags
    VERSION=$(git describe --tags --abbrev=0)
    echo "Latest tag is $VERSION"
    echo "version=${VERSION}" >> $GITHUB_OUTPUT
```

- The tag was used to build the docker image for the backend application with dev tag for the `dev` environment and push it to the docker registry.

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Build & push backend1
  uses: docker/build-push-action@v5
  with:
    context: ./backend1
    file: ./backend1/Dockerfile
    push: true
    tags: |
      ${{ env.REGISTRY }}/${{ env.BACKEND1_IMAGE_NAME }}:dev-${{ steps.get_tag.outputs.version }}
      ${{ env.REGISTRY }}/${{ env.BACKEND1_IMAGE_NAME }}:dev-latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

- The backend workflow was run on the `backend-runner` self-hosted runnera and ran successfully.

![alt text](materials/image-43.png)

- From the dev environment, it created two docker images for dev:

- `dev-latest` which indicates the latest version of dev environment.

- `dev-{version}` which indicates the version of the dev environment.

![alt text](materials/image-44.png)

- **_The inbuild caching was implemented using the `cache-from` and `cache-to` options in the Docker buildx command._**

```yaml
cache-from: type=local,src=/tmp/.buildx-cache-backend1
cache-to: type=local,dest=/tmp/.buildx-cache-backend1,mode=max
```

![alt text](materials/image-39.png)

![alt text](materials/image-40.png)

![alt text](materials/image-41.png)

- **_The caching was implemented in the `build.yaml` workflow file for the backend application but it was taking a lot of time to build the backend application as it is due to local storage of the cache._**

- **_So the caching was implemented using the GitHub Actions cache_**

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

![alt text](materials/image-42.png)

### Main Environment:

[Workflow for Main Environment](code/prod.yaml)

- Similarly as the dev environment the latest tag of the release of the application was fetched.

- It was used to build two docker image that indicates the latest version of the production environment and the version of the production environment.

- Created a pull request to the `main` branch and pushed the stable code to the `main` branch.

![alt text](materials/image-48.png)

- Created a title with `feat` to bump the minor version of the application.

![alt text](materials/image-46.png)

- The commit message needs to be in the format for the semantic release to work properly.

![alt text](materials/image-49.png)

- A semantic release was created for the project when the changes were merged to the `main` branch.

![alt text](materials/image-50.png)

- The backend application was built and pushed to the docker registry with the latest tag and the version tag created from the semantic release.

![alt text](materials/image-51.png)

Backend1:
![alt text](materials/image-52.png)

Backend2:
![alt text](materials/image-53.png)

```yaml
- name: Build & push backend1 (main)
  uses: docker/build-push-action@v5
  with:
    context: ./backend1
    file: ./backend1/Dockerfile
    push: true
    tags: |
      ${{ env.REGISTRY }}/${{ env.BACKEND1_IMAGE_NAME }}:${{ steps.get_tag.outputs.version }}
      ${{ env.REGISTRY }}/${{ env.BACKEND1_IMAGE_NAME }}:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

- The docker images are compressed and saved as artifacts which can be used to deploy the application later.

```yaml
- name: Save and compress backend1 Docker image
  run: |
    rm -f backend1.tar.gz || true
    docker save ${{ secrets.DOCKERHUB_USERNAME }}/fellowship-backend1:${{ steps.get_tag.outputs.version }} | gzip > backend1.tar.gz
  continue-on-error: true

- name: Upload backend1 image tar
        uses: actions/upload-artifact@v4
        if: success() && hashFiles('backend1.tar.gz') != ''
        with:
          name: backend1-image-${{ github.run_id }}-${{ github.run_attempt }}
          path: backend1.tar.gz
          retention-days: 7
```

- The artifacts of the docker images of backend,frontend and trivy scan were created and are seen during the workflow run.

![alt text](materials/image-45.png)

---

### Frontend:

![Workflow for Frontend](code/build.yaml)
![Workflow for Frontend](code/prod.yaml)

- Similarly as the backend application the frontend application image was built and pushed to the docker registry with the latest tag and the version tag created from the semantic release from both the dev and main environments.

```yaml
- name: Build & push frontend (main)
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}:${{ steps.get_tag.outputs.version }}
            ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- The static files of the frontend application were built and uploaded as artifacts to the workflow run.

```yaml
- name: Install frontend dependencies and build static site
  working-directory: frontend
  env:
    VITE_BASE_PATH: /github_actions/frontend/
  run: |
    yarn install --frozen-lockfile
    yarn build

- name: Upload frontend static hashFiles
  uses: actions/upload-artifact@v4
  with:
    name: frontend-dist
    path: frontend/dist
```

- The frontend application images were compressed and saved as artifacts which can be used to deploy the application later.

```yaml
- name: Save and compress frontend Docker image
  run: |
    rm -f frontend.tar.gz || true
    docker save ${{ secrets.DOCKERHUB_USERNAME }}/fellowship-frontend:${{ steps.get_tag.outputs.version }} | gzip > frontend.tar.gz
  continue-on-error: true

- name: Upload frontend image tar
  uses: actions/upload-artifact@v4
  if: success() && hashFiles('frontend.tar.gz') != ''
  with:
    name: frontend-image-${{ github.run_id }}-${{ github.run_attempt }}
    path: frontend.tar.gz
    retention-days: 7
```

---

## Security Scanning

- Integrated trivy security scan for the backend and frontend docker images.

```yaml
- name: Manual Trivy Setup
  uses: aquasecurity/setup-trivy@v0.2.0
  with:
    cache: true
    version: v0.64.1

- name: Download Trivy HTML template
  run: |
    curl -L -o trivy-template.tpl https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@0.28.0
  with:
    scan-type: "image"
    image-ref: ${{ env.REGISTRY }}/${{ env.BACKEND1_IMAGE_NAME }}:latest
    format: "template"
    template: "@trivy-template.tpl"
    output: "backend1-trivy-report.html"

- name: Upload Trivy report
  uses: actions/upload-artifact@v4
  with:
    name: backend1-trivy-report
    path: backend1-trivy-report.html
```

- The trivy was setup and the a trivy template was downloaded to generate the HTML report of the vulnerabilities found in the docker images.

- The trivy action was ran on all the respective docker images of the backend and frontend applications

- The report was generated and uploaded as an artifact to the workflow run.

## Github Pages

- The frontend application and the trivy scan report was deployed to the GitHub Pages using the `static` branch.

```yaml
- name: Download static file
  uses: actions/download-artifact@v4
  with:
    name: frontend-dist
    path: frontend/dist
```

- First the static file of the frontend that was uploaded was downloaded.

- The trivy scan report html for the backend and frontend docker images were downloaded.

```yaml
- name: Download Trivy report (frontend)
  uses: actions/download-artifact@v4
  with:
    name: frontend-trivy-report
    path: ./

- name: Download Trivy report (backend1)
  uses: actions/download-artifact@v4
  with:
    name: backend1-trivy-report
    path: ./

- name: Download Trivy report (backend2)
  uses: actions/download-artifact@v4
  with:
    name: backend2-trivy-report
    path: ./
```

- The downloaded were copied to the `gh-pages` directory which is used to deploy the GitHub Pages from the `static` branch.

```yaml
  - name: Copy frontend build to gh-pages
        run: |
          mkdir -p gh-pages/frontend
          cp -r frontend/dist/* gh-pages/frontend/

        - run: mkdir -p gh-pages/trivy-report

      - name: Copy frontend-trivy-scan to gh-pages
        run: |
          mkdir -p gh-pages/trivy-report/frontend
          cp frontend-trivy-report.html gh-pages/trivy-report/frontend/index.html

      - name: Copy backend1-trivy-scan to gh-pages
        run: |
          mkdir -p gh-pages/trivy-report/backend1
          cp backend1-trivy-report.html gh-pages/trivy-report/backend1/index.html

      - name: Copy backend2-trivy-scan to gh-pages
        run: |
          mkdir -p gh-pages/trivy-report/backend2
          cp backend2-trivy-report.html gh-pages/trivy-report/backend2/index.html
```

- The `gh-pages` directory was committed and pushed to the `static` branch of the repository by the github actions bot which is used to deploy the GitHub Pages after the build is successful.

- An index.html file is used as the main page of the GitHub Pages.

![alt text](materials/image-81.png)

-At first it creates a new branch `static` if it doesn't exist and then commits the changes to the `static` branch.

- It updates the static files of the frontend application and the trivy scan reports of the backend and frontend docker images by fetching the `static` branch and switching to it.

```yaml
- name: Push static file to static branch
  run: |
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git fetch origin static || true
    git switch static || git switch --orphan static
    rm -rf frontend
    mkdir -p frontend
    cp -r gh-pages/frontend/* frontend/
    git add frontend
    git commit -m "feat: publish frontend build on reports branch at ${{ github.sha }}" || echo "No changes"
    git push origin static

- name: Commit and push Trivy reports
  run: |
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git fetch origin static || true
    git switch static || git switch --orphan static
    cp -r gh-pages/* .
    git add trivy-report
    git commit -m "chore: update trivy reports on ${{ github.sha }}" || echo "No changes"
    git push origin static
```

![alt text](materials/image-79.png)

![alt text](materials/image-80.png)

## Deployment of Docker Containers in VM:

- It is used to deploy the docker containers in another VM using SSH.

- The SSH key of the VM that needs to be accessed is stored in the GitHub secrets and is used to connect to the VM and the VM name and host are stored in the GitHub secrets.

![alt text](materials/image-28.png)

![alt text](materials/image-31.png)

```yaml
if: github.event_name == 'push' || github.event_name == 'workflow_run'
    runs-on: [frontend]
    needs:
      - build-and-push-frontend
      - github-pages

    steps:
      - name: SSH and deploy
        run: |
          rm -f sshkey || true
          echo "${{ secrets.SECRET_KEY }}" > sshkey
          chmod 600 sshkey
          ssh -i ./sshkey ${{ secrets.VM_NAME }}@${{ secrets.VM_HOST }} << 'EOF'
          echo "Deploying frontend..."
          cd /home/krishna/docker-deploy
          docker compose -f app.yaml --env-file .env up -d
          EOF
```

- The ssh key is used to connect the VM and the docker compose file was used to deploy the docker containers in the VM.

![alt text](materials/image-82.png)

Finally the docker containers were started.

![alt text](materials/image-83.png)

## Final Workflow

1. Created a change in the application in the feature branch and was pushed to the feature branch.

![alt text](materials/image-54.png)

2. A pull request was made from the feature branch to the `dev` branch.

![alt text](materials/image-55.png)

![alt text](materials/image-56.png)

3. The PR check workflow was triggered and the connventional commit message was checked and the workflow ran successfully.

![alt text](materials/image-57.png)

4. The changes were merged to the `dev` branch by creating a conventional commit message.

![alt text](materials/image-58.png)

5. The `release-dev` workflow was triggered and the pre-release was created for the project.

![alt text](materials/image-59.png)

![alt text](materials/image-60.png)

6. The semantic pre-release was created from the `release-dev` workflow.

![alt text](materials/image-63.png)

7. The build workflow for the dev environment was triggered and the backend and frontend docker images were built and pushed to the docker registry with the latest dev tag and the pre-release version tag.

![alt text](materials/image-61.png)

![alt text](materials/image-64.png)

8. After the stable code was merged to the `main` branch from the `dev` branch, the `release-main` workflow was triggered and the release was created for the project.

![alt text](materials/image-62.png)

![alt text](materials/image-66.png)

9. The release was created for the project with the latest version of the application.

![alt text](materials/image-75.png)

10. The build workflow for the main environment was triggered and the backend and frontend docker images were built and pushed to the docker registry with the latest tag and the version tag created from the semantic release.

- After the build workflow works github page was triggered and the frontend application was deployed to the GitHub Pages.

![alt text](materials/image-67.png)

10. The artifacts of the docker images were created and uploaded to the workflow run. The artifacts of the trivy scan were also created and uploaded to the workflow run.

![alt text](materials/image-68.png)

11. When the github page

![alt text](materials/image-69.png)

12. The frontend pages, trivy scan report for all the backend and frontend images were deployed to the GitHub Pages.

- The initial page of the Github Page includes a dashboard with the links to the frontend application, backend1 and backend2 applications, and the trivy scan reports.

![alt text](materials/image-70.png)

- The frontend application can be accessed from the github page.

![alt text](materials/image-71.png)

- The trivy scan for the docker images can be accessed from the github page.

![alt text](materials/image-72.png)

![alt text](materials/image-73.png)

![alt text](materials/image-74.png)

13. The docker containers are deployed in another VM and the frontend and backend applications are running successfully.

![alt text](materials/image-78.png)

- The frontend application could be accessed from the browser using the IP address of the VM.

![alt text](materials/image-77.png)

- Finally, the backend and frontend applications were running successfully in the VM.

---

## Conclusion

- The CI/CD pipeline was successfully implemented using GitHub Actions with self-hosted runners for the frontend and backend applications.

- The frontend was deployed to GitHub Pages and the backend applications were built and pushed to the Docker registry.

- The docker containers were deployed in another VM and the frontend and backend applications were running successfully.

---
