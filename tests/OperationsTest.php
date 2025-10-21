<?php
use PHPUnit\Framework\TestCase;
require_once __DIR__ . '/../src/Operations.php';

class OperationsTest extends TestCase {
    public function testBasicLevel() {
        $op = new Operations();
        // use a fixed seed to make the operation deterministic for testing
        $result = $op->getRandomOperationForLevel(1, 'test-seed-basic');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
    }
    public function testAdvancedLevel() {
        $op = new Operations();
        $result = $op->getRandomOperationForLevel(6, 'test-seed-advanced');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
        // result should mention the Gamma function for the chosen integral type
        $this->assertStringContainsString('Gamma', $result['result']);
    }
    public function testExtremeLevel() {
        $op = new Operations();
        $result = $op->getRandomOperationForLevel(12, 'test-seed-extreme');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
        // With the curated extreme problems and fixed seed we expect an applied math author
        $this->assertStringContainsString('Applied Math', $result['author']);
    }
}
