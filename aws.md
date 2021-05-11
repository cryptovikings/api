# AWS RESOURCES

All resources created and in use for our AWS Production setup, broken down by Service, in as bottom-up a list order as is possible with information and detail provided "as-is" for our implementation specifically (ie not discussing what Services are *capable of* outside of what we're using).

A note on **Regions** - *most* of our resources are provisioned within the **Europe (London) *(eu-west-2)*** region. The only one that isn't is our SSL Certificate, which is within **US East (N. Virginia) *(us-east-1)***. Regions can be switched between by a drop-down in the top-right of the navigation bar. Always check that you're in the correct region. Some Services will explicitly state that they do not require region selection.

With that said...



## Route 53

Route 53 is AWS' domain registration and routing Service. Within Route 53, we are using:

- **Registered Domains** - `cryptovikings.io`
- **Hosted Zones** - `cryptovikings.io` - DNS configuration for our domain, pointing the main domain and API subdomain to our other Resources



## Certificate Manager

Certificate Manager issues and maintains SSL Certificates. Navigating to Certificate Manager and switching to the **US East (N. Virginia) *(us-east-1)*** region will show our Certificate.



## IAM (Identity and Access Management)

In IAM, you create Users, Roles and Policies. Roles adopt Policies to produce a permissioning structure. Users adopt Roles to gain Permissions.

We have a couple of Users and several Roles and Policies to configure permissioned access for various Services to interact with each other.

Policies are not listed below, but a lot of our Roles do include custom Policies which can be viewed if desired.

When looking at Roles, there're a couple designations appliable to our use-case:
- **Service Role** - a Role adopting Policies which give permissions on particular Services, assigned to Service Users or implicitly used by Services
- **Instance Profile** - a Role adopting Policies which give permissions on particular Service interactions, assigned to an **EC2** Instance to give it access for those interactions

**Users**
- `Administrator` - main IAM User with Administrator-level permissions as well as *both* Console *and* CLI access, to be used instead of the Root Account
- `CodeDeploy-User` - IAM User with CodeDeploy-related permissions and *only* CLI access, used by the **CodeDeploy** Service in provisioning API deployments and not intended for direct use by us

**Roles**
- `CodeBuildServiceRole-API` : a **Service Role** with permissions necessary for **CodeBuild** to use in building and deploying the API
- `CodeBuildServiceRole-Website` : a **Service Role** with permissions necessary for **CodeBuild** to use in building and deploying the Website
- `CodeDeploy-EC2-Instance-Profile` : **Instance Profile** for our **EC2** Instance serving our API, enabling communication with S3
- `CodeDeployServiceRole` : a **Service Role** with permissions necessary for **CodeDeploy** to work with **EC2** and **S3** in deploying the API
- `CodePipelineServiceRole` : a **Service Role** with permissions necessary for **CodePipeline** to work with **EC2** and **S3** in deploying both the Website and API



## S3 (Simple Storage Service)

S3 is a storage service which uses "Buckets" to store "Objects" (files + folders) with versioning, privacy control, lifecycle events and direct-linking capabilities.

We use S3 to store **CodePipeline** artifacts to use in deployment procedures, as well as the built + deployed Website, which is then distributed through **CloudFront**.

**Buckets**
- `cryptoapi-codebuild-eu-west-2` : Bucket used by **CodeBuild** for storing the source and build results of the API deployment procedure for use in **CodePipeline**
    - **Note:** has a **Lifecycle Event** which selectively expires + deletes old versions of deployment-related artifacts, keeping storage costs down
- `cryptowebsite-codebuild-eu-west-2` : Bucket used by **CodeBuild** for storing the source and build results of the Website deployment procedure for use in **CodePipeline**
    - **Note:** has a **Lifecycle Event** which selectively expires + deletes old versions of deployment-related artifacts, keeping storage costs down
- `cryptovikings.io` : Bucket used as the target for the Website deployment procedure in **CodePipeline**, the contents of which are distributed through **CloudFront**



## EC2 (Elastic Compute Cloud)

EC2 is AWS' VM Service. VMs are provisioned as "Instances" which are based on "AMIs" which denote the OS + general configuration of the VM.

Instances are configured with "Security Groups" which control inbound and outbound traffic to the Instance, and may be configured with "Elastic IPs" which give them a fixed IP address across reboots.

Storage works by attaching "Volumes" to Instances.

All relevant in-use EC2 Resources are listed here:


**Instance**

We have a single Instance for hosting our API. The API's software environment is *mostly* configured automatically as part of the API's deployment procedure via **CodeDeploy**.

Details about the Instance useful in replicating it are listed here:
- **Operating System** : Amazon Linux 2 *(a RedHat-based Linux distribution with the `yum` package manager)*
- **Type** : `t2.micro` - a free-tier and low-power CPU/RAM configuration. To be changed before production
- **Role** : `CodeDeploy-EC2-Instance-Profile`
- **Critical Software** : `CodeDeploy-Agent` (running as a Service, providing compatibility with **CodeDeploy**, not automatically configured)
- **Tags** : *name* : *api-ec2-instance*


**Volumes**

As with our single Instance, we have a single Volume attached to the Instance.

**Type:** SSD
**Size:** 20GB


**Elastic IPs**

We have one Elastic IP, attached to our Instance, to give it a fixed IP across reboots

**IP:** 3.11.245.250


**Security Groups**

We have one Security Group, attached to our Instance, controlling traffic. Inbound and Outbound Rules are not listed here as they are subject to change.


**Key Pairs**

There is a single Key Pair (SSH access credentials) associated with our Instance. It can be obtained from Jonno.



## CloudFront

CloudFront is AWS' core CDN system. You create CloudFront "Distributions" which route internally to other AWS Resources ("Origins"), and can assign CNAME Records to the Distribution so as to allow for Route 53-based domain aliasing in conjunction with the use of a custom SSL Certificate for E2E encryption with a client-level HTTPS enforcement.

We have two CloudFront Distributions, to distribute and configure HTTPS-enforced access to our Website and our API:

- **API**
    - **Domain:** `d35onzaiq6gor6.cloudfront.net`
    - **Alias Domain (configured in conjunction with the Route 53 Hosted Zone):** `api.cryptovikings.io`
    - **Routes into:** our EC2 Instance' Public DNS address
    - **Cache:** disabled
- **Website**
    - **Domain:** `d2se5n84vxwv1x.cloudfront.net`
    - **Alias Domain (configured in conjunction with the Route 53 Hosted Zone):** `cryptovikings.io`
    - **Routes into:** the `cryptovikings.io` S3 Bucket
    - **Cache:** enabled



## CodeBuild/CodeDeploy/CodePipeline

Collectively *(alongside **CodeCommit** and **CodeArtifact**, which we are not using)* referred to as **CodeStar**, these Services work together to form one approach within AWS to automatically configure and provision deployments.

These Services are extremely complicated and involved so there is limited as-necessary explanation on our usage.

As a primer and overhead example, a **Pipeline** configured through **CodePipeline** will involve stages which may produce/retrieve resources (eg. source code from a repository), pass them onto other stages (eg. to a **CodeBuild** configuration), and eventually execute some form of deployment (eg. by passing the build result onto a **CodeDeploy** configuration).

We have two distinct **CodeStar** setups, configuring deployments for the API and Website separately. This is best viewed "top down" as in that we have two **CodePipeline** configurations, which themselves use one **CodeBuild** configuration each, and one of which then uses **CodeDeploy**. A full bottom-up overview is below:


**CodeBuild**

In CodeBuild, you create "Build Projects" which effectively represent Containerized Execution stages used for doing things like running source compilations and packaging build Artifacts for use in other **Pipeline** Stages. With a Build Project, you configure the Docker Environment and may provide a "BuildSpec" - a YAML file configuring the behavior of the Execution (what happens during the Build) - either directly within AWS or indirectly in project source.

We have two Build Projects:

- `Website-Build-Project` : for building the website, as cloned from its Git Repository, and producing a flatly-structured Zip Artifact for providing to an S3 Deployment Stage in the associated **Pipeline**. BuildSpec runs `yarn install` and then `npm run build`
- `API-Build-Project` : for preparing the **CodeDeploy**-ready deployment Artifact, effectively just a packaged Zip containing the Git Repository clone. BuildSpec does nothing, as we rely on CodeDeploy for all our actual API-related build configuration (described below)


**CodeDeploy**

In CodeDeploy, you create "Applications" which represent projects you'd like to deploy to a given destination/resource. Applications contain "Deployment Groups" which designate the target resources (eg. EC2 Instance(s)). "Deployments" can be created to deploy to the Group.

We use CodeDeploy to deploy the API to our EC2 Instance. CodeDeploy supports "Event Scripts/Hooks", which it executes as part of its deployment procedure. In the API source, the `appspec.yml` file is the configuration for CodeDeploy, telling it where to put the application and hooking some custom bash scripts to its Events. The Scripts are found in the `aws` directory.

We use these Event Hooks to fully configure the EC2 Instance's software environment with `Mongo`, `Node`, etc, as well as to build and configrue the API source when it lands on the server, and also to start the API once deployment is complete.

We have one Application (`API`), with one Deployment Group (`API-Deployment-Group`), which targets any EC2 Instance with the tag *name* with a value of *api-ec2-instance*, which naturally selects the Instance described above, as well as - conveniently - any future Instances we launch with that tag.


**CodePipeline**

In CodePipeline, you create "**Pipelines**" which configure stages which bring systems together and action a full deployment involving other CodeStar resources.

For GitHub-related actions, an AWS Application is installed on the GitHub side which provides OAuth Access for Repository Clones, and an associated GitHub Connection is maintained by AWS.

**Note:** The GitHub Connection will need to be reconfigured when we move repositories.
**Note:** The GitHub Full Clone Actions described below are currently not automated, and the Website Action isn't pointing to Master.

We have two Pipelines, encompassing the CodeBuild and CodeDeploy configurations described above. The below is a description of their Stages:

- `API-Pipeline` - for deploying the API
    - `Source` - a GitHub Full Clone Action, cloning **master**, producing a **Source Artifact** (Repo Metadata)
        - Source Artifact goes to the `cryptoapi-codebuild-eu-west-2` S3 Bucket
    - `Build` - pick up the **Source Artifact** and pass it into the `API-Build-Project` **CodeBuild Project**, producing a **Build Artifact** (packaged Repo)
        - Build Artifact goes to the `cryptoapi-codebuild-eu-west-2` S3 Bucket
    - `Deploy` - pick up the **Build Artifact** and pass it into the **CodeDeploy API Application**, triggering a fresh **Deployment** to our EC2 Instance
- `Website-Pipeline` - for deploying the Website
    - `Source` - a GitHub Full Clone Action, cloning **poc_2**, producing a **Source Artifact** (Repo Metadata)
        - Source Artifact goes to the `cryptowebsite-codebuild-eu-west-2` S3 Bucket
    - `Build` - pick up the **Source Artifact** and pass it into the `Website-Build-Project` **CodeBuild Project**, prodicing a **Build Artifact** (built and ready-to-deploy Website)
        - Build Artifact goes to the `cryptowebsite-codebuild-eu-west-2` S3 Bucket
    - `Deploy` - Pick up the **Build Artifact** and upload/unzip it directly into the `cryptovikings.io` S3 Bucket
