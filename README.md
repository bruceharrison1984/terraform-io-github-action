# terraform-io-github-action
GitHub Action for retrieving Terraform state information from Terraform.io

## Usage
| Argument           | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| Organization       | The name of the Terraform.io organization                      |
| Workspace          | The name of the Terraform.io workspace                         |
| terraformApiToken  | Terraform.io token that has permission to access the workspace |

## Example
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Get Terraform state
        id: tfState
        uses: bruceharrison1984/terraform-io-github-action@v1.3
        with:
          organization: ${{ secrets.TERRAFORM_IO_ORG }}
          workspace: ${{ secrets.TERRAFORM_IO_WORKSPACE }}
          terraformApiToken: ${{ secrets.TERRAFORM_IO_TOKEN }}
      - name: Print the entire output
        run: echo ${{ steps.tfState.outputs.json }}
      - name: Get specific value on purpose
        run: echo ${{ steps.tfState.outputs.ecs_cluster_name }}
      - name: Get specific value from json
        run: echo "VALUE - $(echo '${{ steps.tfState.outputs.json }}' | jq -r '.ecs_cluster_name')"
```

## Outputs
| Argument           | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| organization       | The name of the Terraform.io organization                      |
| workspace          | The name of the Terraform.io workspace                         |
| json               | JSON encoded string of the output values                       |
| <output_name>      | Value from the Terraform output                                |

### dynamic output values
If you know the name of the output value, you can reference it directly in your GitHub action.
```jq
{
  "ecs_cluster_name": "my-ecs-cluster",
  "private_subnet_ids": [
    "subnet-06dac358298756a1f",
    "subnet-0fb87bce7d536cd85",
    "subnet-0fce716bf1fd0059d"
  ],
}
```

```yaml
  - name: Get specific value on purpose
    run: echo ${{ steps.tfState.outputs.ecs_cluster_name }}
```
It should be stated that if you are attempting to retrieve an array or object value, it will be returned as a string. This is a limitation in how
GitHub Actions deals with types. It only support `string, bool, int` types. You will need to use some other process to transform your object/array in to the
shape that you need. See the below `jq` example for some direction.


### json output
The json output is JSON encoded, so it is up to you to extract the values from there.

`jq` is a resonable solution for extracting values from tf_outputs. Take the following tf_outputs:

```jq
{
  "ecs_cluster_name": "my-ecs-cluster",
  "private_subnet_ids": [
    "subnet-06dac358298756a1f",
    "subnet-0fb87bce7d536cd85",
    "subnet-0fce716bf1fd0059d"
  ],
}
```

```yaml
## Example Github action run command
  - name: Get specific value
    run: echo "VALUE - $(echo '${{ steps.tfState.outputs.json }}' | jq -r '.ecs_cluster_name')"
```

The following would be output:
```sh
 > VALUE - my-ecs-cluster
```
