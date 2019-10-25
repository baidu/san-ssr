it('date data with init data', function (done) {
    // [inject] init

    const b = wrap.getElementsByTagName('b')[0]

    expect(b.title).toBe('1996')

    myComponent.data.set('date', new Date('1984-10-10T00:00:00.000Z'))

    san.nextTick(function () {
        const b = wrap.getElementsByTagName('b')[0]

        expect(b.title).toBe('1984')

        myComponent.dispose()
        document.body.removeChild(wrap)
        done()
    })
})
