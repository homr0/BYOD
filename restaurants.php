<?php

    function getRestaurants($region){
        $API_KEY = '-7nfonCOnXQYc8aFYuYjV8b6IJqtxgeu88MufQf3WSeWaozRpg9nIHAQxR-R30dWEnv0IY-4vQKVmr5Fq8EY28A-iBmWOMU2E8BipBUz_Cn0VHHaYmtnPrzPBg_-W3Yx';

        // Complain if credentials haven't been filled out.
        assert($API_KEY, "Please supply your API key.");
    
        // API constants
        $API_HOST = "https://api.yelp.com";
        $SEARCH_PATH = "/v3/businesses/search";
        $BUSINESS_PATH = "/v3/businesses/";  // Business ID will come after slash.

        
        $url_params = array();
    
        $url_params['term'] = 'restaurants';
        $url_params['location'] = $region;
        $url_params['limit'] = 10;


        // Send Yelp API Call
        try {
            $curl = curl_init();
            if (FALSE === $curl){
                throw new Exception('Failed to initialize');
            }

            $url = $API_HOST . $SEARCH_PATH . "?" . http_build_query($url_params);
            curl_setopt_array($curl, array(
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,  // Capture response.
                CURLOPT_ENCODING => "",  // Accept gzip/deflate/whatever.
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => array(
                "authorization: Bearer " . $GLOBALS['API_KEY'],
                "cache-control: no-cache",
                ),
            ));

            $response = curl_exec($curl);

            if (FALSE === $response){
                throw new Exception(curl_error($curl), curl_errno($curl));
            }
            $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            if (200 != $http_status){
                throw new Exception($response, $http_status);
            }
            curl_close($curl);
        } catch(Exception $e) {
            trigger_error(sprintf(
                'Curl failed with error #%d: %s',
                $e->getCode(), $e->getMessage()),
                E_USER_ERROR);
        }
    
        return $response;
    }

?>