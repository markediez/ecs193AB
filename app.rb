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
	puts "data received ----"
	puts params[:img]
	puts "\n\n\n"
	data = params[:img]
	filename = "test.png"
	
	uri = URI::Data.new(data)
	File.write("public/uploads/#{filename}", uri.data)	

	#puts data 
	#puts "================="

	## Decode the image
	#data_index = data.index('base64') + 7
	#filedata = data.slice(data_index)
	#puts filedata
	#decoded_image = Base64.decode64(filedata)
	
	#puts filedata
	#puts "-----------------"
	
	## Write to file system
	#file = File.new("public/uploads/#{filename}", "w+")
	#file.write(decoded_image)
	#File.new("/public/uploads/#{filename}", 'wb')

	"/uploads/#{filename}"
end
