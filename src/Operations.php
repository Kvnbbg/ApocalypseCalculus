<?php

class Operations {
    private $operations;

    public function __construct() {
        // Initialize operations array with operation generators
        $this->operations = [
            // Basic operations are defined in JavaScript for frontend calculation
            // Here we define server-side validation functions
        ];
    }

    public function getRandomOperation() {
        // In this PHP version, operations are generated client-side
        // This method is a placeholder for future server-side operation generation
        return [
            'success' => true
        ];
    }

    public function checkAnswer($userAnswer, $expectedAnswer) {
        $userAnswer = trim($userAnswer);
        $expectedAnswer = trim($expectedAnswer);
        
        if (empty($expectedAnswer)) {
            return false;
        }

        // Case-insensitive comparison for text answers
        if (strtolower($userAnswer) === strtolower($expectedAnswer)) {
            return true;
        }

        // Yes/No handling
        if (preg_match('/^yes$|^no$|^y$|^n$/i', $expectedAnswer)) {
            if (preg_match('/^yes$|^y$|^true$|^1$/i', $userAnswer)) {
                return preg_match('/^yes|y|true|1/i', $expectedAnswer);
            }
            if (preg_match('/^no$|^n$|^false$|^0$/i', $userAnswer)) {
                return preg_match('/^no|n|false|0/i', $expectedAnswer);
            }
        }

        // Numeric comparison with tolerance
        $userNum = $this->extractNumber($userAnswer);
        $expectedNum = $this->extractNumber($expectedAnswer);
        
        if ($userNum !== null && $expectedNum !== null) {
            $absDiff = abs($userNum - $expectedNum);
            $rel = abs($absDiff / (abs($expectedNum) + 1e-9));
            return ($absDiff <= 0.01 || $rel <= 0.005);
        }

        // Normalized string comparison
        $normalizeStr = function($str) {
            return strtolower(preg_replace('/[^a-z0-9\.\^%\-]+/i', '', $str));
        };

        return $normalizeStr($userAnswer) === $normalizeStr($expectedAnswer);
    }

    private function extractNumber($str) {
        if (preg_match('/^-?\d*\.?\d+(?:e[+-]?\d+)?$/', $str)) {
            return floatval($str);
        }
        return null;
    }
}