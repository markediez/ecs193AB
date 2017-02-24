require 'sinatra'  # Managing routes
require 'data_uri'
require 'json'
configure { set :server, :puma }

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

# Route for our video
post '/remove' do
	data = params[:img]
	filename = params[:filename]

	uri = URI::Data.new(data)
	File.write("public/uploads/#{filename}", uri.data)

	# Encode repaired image
	path = "public/uploads/test.png"
	returnData = 'data:image/png;base64,'
	File.open(path, 'rb'){ |file| returnData += Base64.encode64(file.read) }

	# Return most updated image
	content_type :json
	{:img => returnData}.to_json
end
