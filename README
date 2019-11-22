Running the application:
	In the other, enter the command 'node app.js'
	Run on https://localhost:3000/login (must be https)

Switching between different Modes:
	Before running the project, set the NODE_ENV variable to the desired mode. Defaults to development
	On Mac: export NODE_ENV=[development, testing, staging, production]
	On Windows: SET NODE_ENV=[development, testing, staging, production]

Facebook App Secret, App ID is stored inside of an environment variable called FB_APP_SECRET, FB_APP_ID

To get a signed certificate with SAN. This only works for localhost. Change localhost to URL for production
	openssl genrsa -out ca.key 2048
	openssl req -new -x509 -days 365 -key ca.key -subj "/C=CN/ST=GD/L=SZ/O=Acme, Inc./CN=Acme Root CA" -out ca.crt
	openssl req -newkey rsa:2048 -nodes -keyout server.key -subj "/C=CN/ST=GD/L=SZ/O=Acme, Inc./CN=localhost" -out server.csr
	openssl x509 -req -extfile <(printf "subjectAltName=DNS:localhost,DNS:localhost") -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
Add to keychain on MacOS and double click and select always allow
