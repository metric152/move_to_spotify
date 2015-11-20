<?php 
define("RDIO_CLIENT_SECRET", "rdio secret");
define("RDIO_TOKEN_URI", "https://services.rdio.com/oauth2/token");

define("SPOTIFY_CLIENT_SECRET", "spotify secret");
define("SPOTIFY_TOKEN_URI", "https://accounts.spotify.com/api/token");

// Pull in JSON
// http://stackoverflow.com/questions/19254029/angularjs-http-post-does-not-send-data
$params = json_decode(file_get_contents('php://input'),true);

/**
 * Return a failure message
 * @param unknown $message
 */
function setErrorHeader($message){
	http_response_code(404);
	header('Content-Type: application/json');
	echo $message;
}

/**
 * Return a success message
 * @param unknown $message
 */
function setSuccessHeader($message){
	http_response_code(200);
	header('Content-Type: application/json');
	echo $message;
}

/**
 * Configure a curl object
 * @return unknown
 */
function setUpRdioCurl($clientId, $data){
    $ch = curl_init();
    
    // Set POST URI
    curl_setopt($ch, CURLOPT_URL, RDIO_TOKEN_URI);
    // Set auth
    // http://www.rdio.com/developers/docs/web-service/oauth2/overview/ref-oauth2-client-verification
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, $clientId.':'.RDIO_CLIENT_SECRET);
    // Set Content-Type
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    // Capture the json data
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Allow the header to be dumped
    curl_setopt($ch, CURLINFO_HEADER_OUT, true);
    
    // Set POST Data
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    
    return $ch;
}

/**
 * Get a new token
 * @param unknown $redirectUri
 * @param unknown $clientId
 * @param unknown $code
 */
function getRdioToken($redirectUri, $clientId, $code){
	$result = null;
	$error = false;
	$ch = setUpRdioCurl($clientId, [
		'grant_type' => 'authorization_code',
		'code' => $code,
		'redirect_uri' => $redirectUri
	]);
	
	// Run query
	$result = curl_exec($ch);
	
	// Something failed during the request
	if(curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400){
		$error = true;
	}
	curl_close($ch);
	
	if($error) return setErrorHeader($result);
	
	// Return our token data
	return setSuccessHeader($result);
}
/**
 * Get a new token with a refresh token
 * @param unknown $refreshToken
 */
function getRdioRefreshToken($clientId, $refreshToken){
    $result = null;
    $error = false;
    $ch = $ch = setUpRdioCurl($clientId, [
        'grant_type' => 'refresh_token',
        'refresh_token' => $refreshToken
    ]);
    
    // Run query
    $result = curl_exec($ch);
    
    // Something failed during the request
    if(curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400){
        $error = true;
    }
    curl_close($ch);
    
    if($error) return setErrorHeader($result);
    
    // Return our token data
    return setSuccessHeader($result);
}

// Go get the spotify token
function getSpotifyToken($code){
	
}


// Figure out what we need to do
switch($params['client']){
	case 'rdio':
	    if($params['task'] == 'refresh_token'){
	        return getRdioRefreshToken($params['clientId'], $params['refresh_token']);
	    }
	    elseif($params['task'] == 'token'){
	        return getRdioToken($params['redirectUri'], $params['clientId'], $params['code']);
	    }
		
	case 'spotify':
		return getSpotifyToken($params['code']);
	default:
		return setErrorHeader(json_encode(['error' => 'No client set']));
}

?>