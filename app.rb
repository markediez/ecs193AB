require 'sinatra'  # Managing routes
require 'data_uri' # Saving photos
require 'json'
configure { set :server, :puma }
configure { set :port, 80 }

# Open views/index.erb
get '/' do
	erb :index
end

# Open views/stylesheet.scss
get '/stylesheet.css' do
	scss :stylesheet
end

# Open public/app.js
get '/app.js' do
	js :app
end

# Query for latest image
get '/get_content' do
	# TODO: Return content
end

post '/send_box' do
	# TODO: Do the ruby way
	system("echo #{params[:x]}, #{params[:y]}, #{params[:width]}, #{params[:height]} >> public/uploads/coordinates.txt")
	

	if File.exist?("public/uploads/coordinates.txt")
		status 200
		body ''
	else
		# Probably the wrong status code
		status 500
		body 'error occured while saving bounding box'
	end
end

# Route for our video
post '/remove' do
	data = params[:img]
	filename = params[:filename]

	# Create public/uploads folder if it doesn't exist
	dirname = "public/uploads"
	unless File.directory?(dirname)
  		system("mkdir #{dirname}")
	end

	uri = URI::Data.new(data)
	File.write("public/uploads/#{filename}", uri.data)

	# Run C++ or something to repair
	path = "public/uploads/test.png"

	# Encode repaired image
	returnData = 'data:image/png;base64,'
	File.open(path, 'rb'){ |file| returnData += Base64.encode64(file.read) }

	# Return most updated image
	content_type :json
	{:img => returnData}.to_json
end
