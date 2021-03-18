const core = require('@actions/core');
const axios = require('axios').default;

void async function main() {
  try {
    const organization = core.getInput('organization');
    const workspace = core.getInput('workspace');
    const terraformApiToken = core.getInput('terraformApiToken');
  
    const terraformIoClient = axios.create({
      baseURL: 'https://app.terraform.io',
      timeout: 1000,
      headers: {
        'Content-Type': 'application/vnd.api+json; charset=utf-8',
        'Authorization': `Bearer ${terraformApiToken}`
        }
    });

    const newestWorkspace = await terraformIoClient.get(`/api/v2/organizations/${organization}/workspaces/${workspace}`)
      .then(resp => resp.data.data.relationships['current-state-version'].links.related)

    console.log(`Newest workspace link: ${newestWorkspace}`)

    const rawWorkspaceState = await terraformIoClient.get(`${newestWorkspace}?include=outputs`);
    const outputs = Object.assign({}, ...rawWorkspaceState.data.included.map(x => ({ [x.attributes.name]: x.attributes.value })));

    core.setOutput("tf_outputs", outputs);
    core.setOutput("organization", organization);
    core.setOutput("workspace", workspace);

    for (const output in outputs) {
      core.setOutput(output, outputs[output]);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}()


