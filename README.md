# Setting up in AWS - EC2 Instance
0. Make sure your instance has HTTP inbound in security group -- make the source "anywhere"
1. Clone the project `git clone https://github.com/markediez/ecs193AB`
2. Run `./install.sh` (you may need to give run permission `chmod +x ./install.sh`)
3. Run the server `./server.sh`

# Convention
## HTML
	1. Filenames should be `snake_case`
	2. All id and class names should use lowercase and dashes
		e.g. `my-class, foo, bar`
	3. Do not inject any JS-like stuff e.g. onClick / on-click. These should be event listeners in a js file
## CSS / SASS
	1. Filenames should be `snake_case`
	2. `$variables` should use lowercase and dashes.
	
## JavaScript
	1. Filenames should be `snake_case`
	2. Variable names should be in `camelCase`

## Ruby
	1. Filenames should be in `snake_case`
	2. Variable and function names should be in `snake_case`
