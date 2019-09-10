it('update if, init with false', function (done) {
    // [inject] init

    myComponent.data.set('cond', true)
    const spans = wrap.getElementsByTagName('span')

    expect(spans.length).toBe(0)

    san.nextTick(function () {
        const span = wrap.getElementsByTagName('span')[0]

        expect(span.title).toBe('errorrik')
        expect(span.innerHTML.indexOf('errorrik')).toBe(0)

        myComponent.dispose()
        document.body.removeChild(wrap)
        done()
    })
})
