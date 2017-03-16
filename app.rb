require 'sinatra'  # Managing routes
require 'sinatra-websocket' # For web sockets
require 'data_uri' # Saving photos
require 'json'
require 'yaml'	# For environment and secret data
require 'thin'

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
      settings.sockets << ws
    end
    ws.onmessage do |msg|
			msg = JSON.parse(msg)
			data = msg["img"]
			filename = msg["filename"]

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
			File.open(path, 'rb'){ |file| returnData += Base64.encode64(file.read) } if File.exists?(path)
      EM.next_tick { settings.sockets.each{ |s| s.send(returnData) } }
    end
    ws.onclose do
      warn("websocket closed")
      settings.sockets.delete(ws)
    end
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

post '/send_box' do
	# TODO: Do the ruby way
	dirname = "public/box"
	unless File.directory?(dirname)
	    system("mkdir #{dirname}")
    end
	system("echo #{params[:x]}, #{params[:y]}, #{params[:width]}, #{params[:height]} > #{dirname}/coordinates.txt")

	
	if File.exist?("#{dirname}/coordinates.txt")
		status 200
		body ''
	else
		# Probably the wrong status code
		status 500
		body 'error occured while saving bounding box'
	end
end
