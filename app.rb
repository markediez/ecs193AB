require 'sinatra'  # Managing routes
require 'sinatra-websocket' # For web sockets
require 'data_uri' # Saving photos
require 'json'
require 'yaml'	# For environment and secret data

# Load config files
settings_path = "config/config.yml"
if File.file?(settings_path)
	SETTINGS = YAML.load_file(settings_path)
else
	puts "Please configure config/config.yml file using config/config.example.yml"
	exit
end

# Set server
port = SETTINGS["ENV"] == "development" ? 4567 : 80
set :server, :thin
set :port, port
set :sockets, []

# Open views/index.erb
get '/' do
	erb :index
end

get '/meeting' do
	return "" unless request.websocket?

	# https://github.com/simulacre/sinatra-websocket
	request.websocket do |ws|
    ws.onopen do
      ws.send("Meeting Connected!")
      settings.sockets << ws
    end
    # ws.onmessage do |msg|
    #   EM.next_tick { settings.sockets.each{|s| s.send(msg) } }
    # end
    # ws.onclose do
    #   warn("websocket closed")
    #   settings.sockets.delete(ws)
    # end
	end
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
	# Run C++ or something to repair
	path = "public/uploads/test.png"

	# Encode repaired image
	returnData = 'data:image/png;base64,'
	File.open(path, 'rb'){ |file| returnData += Base64.encode64(file.read) }

	# Return most updated image
	content_type :json
	{:img => returnData}.to_json
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

	if File.exists?("public/uploads/#{filename}")
		status 200
		body ''
	else
		# Again, probably wrong
		status 500
		body 'Could not save image...'
	end
end
