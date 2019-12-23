it('html text concat expr', function (done) {
    // [inject] init

    expect(wrap.getElementsByTagName('div')[0].innerHTML).toContain('13')

    myComponent.dispose()
    document.body.removeChild(wrap)
    done()
})
