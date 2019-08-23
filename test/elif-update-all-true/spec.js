it('update elif, init with all true', function (done) {
    // [inject] init

    const spans = wrap.getElementsByTagName('span')
    expect(spans.length).toBe(1)
    expect(spans[0].title).toBe('errorrik')

    myComponent.data.set('cond1', false)

    san.nextTick(function () {
        const spans = wrap.getElementsByTagName('span')
        expect(spans.length).toBe(1)
        expect(spans[0].title).toBe('leeight')

        myComponent.data.set('cond2', false)
        san.nextTick(function () {
            const spans = wrap.getElementsByTagName('span')
            expect(spans.length).toBe(0)

            myComponent.dispose()
            document.body.removeChild(wrap)
            done()
        })
    })
})
