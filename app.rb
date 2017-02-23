require 'sinatra'  # Managing routes
require 'data_uri'
configure { set :server, :puma }

get '/' do
	erb :index
end

get '/stylesheet.css' do
	scss :stylesheet
end

get '/app.js' do 
	js :app
end

# http://azemoh.com/2016/05/17/sinatra-managing-file-uploads/
post '/remove' do 
	data = params[:img]
	filename = params[:filename]
	
	uri = URI::Data.new(data)
	File.write("public/uploads/#{filename}", uri.data)	

	"/uploads/#{filename}"
end
