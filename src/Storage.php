<?php

class Storage {
    private $useRedis;
    private $redis;
    
    public function __construct() {
        // Check if Redis is available (for Railway deployment)
        $this->useRedis = getenv('REDIS_URL') !== false;
        
        if ($this->useRedis) {
            try {
                $this->redis = new Redis();
                $url = parse_url(getenv('REDIS_URL'));
                $this->redis->connect($url['host'], $url['port']);
                if (!empty($url['pass'])) {
                    $this->redis->auth($url['pass']);
                }
            } catch (Exception $e) {
                $this->useRedis = false;
            }
        }
    }
    
    public function get($key) {
        if ($this->useRedis) {
            try {
                return $this->redis->get($key);
            } catch (Exception $e) {
                return null;
            }
        }
        return null;
    }
    
    public function set($key, $value, $expiry = 86400) {
        if ($this->useRedis) {
            try {
                $this->redis->setex($key, $expiry, $value);
                return true;
            } catch (Exception $e) {
                return false;
            }
        }
        return false;
    }
    
    public function increment($key) {
        if ($this->useRedis) {
            try {
                return $this->redis->incr($key);
            } catch (Exception $e) {
                return 0;
            }
        }
        return 0;
    }
}