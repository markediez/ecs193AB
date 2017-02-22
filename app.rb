require 'sinatra'
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
