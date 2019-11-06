<?php
class SanData {
    private $ctx;
    private $data;
    private $computedNames;

    public function __construct(&$ctx) {
        $this->ctx = &$ctx;
        $this->data = &$ctx->data;
        $this->computedNames = array_flip($ctx->computedNames);
    }

    public function get ($path) {
        if (array_key_exists($path, $this->computedNames)) {
            return _::callComputed($this->ctx, $path);
        }
        return $this->data->$path;
    }
}

class SanComponent {
    public $data;
    public function __construct () {}
}