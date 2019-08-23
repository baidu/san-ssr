it("slot insert element 'template' apply if", function (done) {
    // [inject] init

    const ps = wrap.getElementsByTagName('p')
    const h2s = wrap.getElementsByTagName('h2')
    const h3s = wrap.getElementsByTagName('h3')
    const h4s = wrap.getElementsByTagName('h4')
    const h5s = wrap.getElementsByTagName('h5')

    expect(ps[0].innerHTML).toBe('300')
    expect(h2s.length).toBe(0)
    expect(h3s.length).toBe(0)
    expect(h4s.length).toBe(1)
    expect(h5s.length).toBe(0)

    myComponent.data.set('num', 30000)

    san.nextTick(function () {
        expect(ps[0].innerHTML).toBe('30000')
        expect(h2s.length).toBe(1)
        expect(h3s.length).toBe(0)
        expect(h4s.length).toBe(0)
        expect(h5s.length).toBe(0)

        myComponent.data.set('num', 10)
        san.nextTick(function () {
            expect(ps[0].innerHTML).toBe('10')
            expect(h2s.length).toBe(0)
            expect(h3s.length).toBe(0)
            expect(h4s.length).toBe(0)
            expect(h5s.length).toBe(1)

            myComponent.dispose()
            document.body.removeChild(wrap)
            done()
        })
    })
})
