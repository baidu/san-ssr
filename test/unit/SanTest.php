<?php
include('src/San.php');

use PHPUnit\Framework\TestCase;

final class SanTest extends TestCase
{
    public function testExtend(): void
    {
        $target = (object)["foo" => "FOO", "bar" => "BAR"];
        $source = (object)["bar" => "bar", "coo" => "COO"];
        San::extend($target, $source);

        $this->assertEquals((object)[
            "foo" => "FOO",
            "bar" => "bar",
            "coo" => "COO"
        ], $target);
    }
    public function testEach(): void
    {
        $result = "";
        $iter = function ($val, $key) use (&$result) {
            $result .= $key . ":" . $val . ";";
        };
        San::each(["foo", "bar", "coo"], $iter);
        $this->assertEquals(
            "0:foo;1:bar;2:coo;",
            $result
        );
    }
    public function testEachBreak(): void
    {
        $result = "";
        $iter = function ($val, $key) use (&$result) {
            $result .= $key . ":" . $val . ";";
            if ($key == 1) return false;
        };
        San::each(["foo", "bar", "coo"], $iter);
        $this->assertEquals(
            "0:foo;1:bar;",
            $result
        );
    }
    public function testContainsWhenContains(): void
    {
        $this->assertEquals(
            true,
            San::contains(["foo", "bar", "coo"], "bar")
        );
    }
    public function testContainsWhenNotContains(): void
    {
        $this->assertEquals(
            false,
            San::contains(["foo", "bar", "coo"], "haa")
        );
    }
    public function testHtmlFilterReplacer(): void {
        $this->assertEquals(
            "&gt;",
            San::htmlFilterReplacer(">")
        );
    }
    public function testEscapeHtml(): void {
        $this->assertEquals(
            "&lt;a class=&#039;&amp;&quot;&#039;&gt;",
            San::escapeHTML("<a class='&\"'>")
        );
    }
    public function testClassFilter(): void {
        $this->assertEquals(
            "foo bar coo",
            San::_classFilter(["foo", "bar", "coo"])
        );
    }
    public function testStyleFilter(): void {
        $this->assertEquals(
            "height:20px;width:30px;",
            San::_styleFilter(["height" => "20px", "width" => "30px"])
        );
    }
    public function testXClassFilter(): void {
        $this->assertEquals(
            "haha foo bar coo",
            San::_xclassFilter(["foo", "bar", "coo"], "haha")
        );
    }
    public function testXStyleFilter(): void {
        $this->assertEquals(
            "haha;height:20px;width:30px;",
            San::_xstyleFilter(["height" => "20px", "width" => "30px"], "haha")
        );
    }
    public function testAttrFilter(): void {
        $this->assertEquals(
            ' height="20px"',
            San::attrFilter("height", "20px")
        );
    }
    public function testBoolAttrFilterFalse(): void {
        $this->assertEquals(
            '',
            San::boolAttrFilter("checked", "false")
        );
    }
    public function testBoolAttrFilterTrue(): void {
        $this->assertEquals(
            ' checked',
            San::boolAttrFilter("checked", "true")
        );
    }
    public function testDefaultStyleFilter(): void {
        $this->assertEquals(
            'height:20px;',
            San::defaultStyleFilter(["height" => "20px"])
        );
    }
}
