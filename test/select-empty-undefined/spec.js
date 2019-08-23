it('select, null and undefined should select empty option, init undefined', function (done) {
    // [inject] init

    const select = wrap.getElementsByTagName('select')[0]

    expect(select.selectedIndex).toBe(2)
    expect(select.value).toBe('')
    myComponent.data.set('online', 'errorrik')

    san.nextTick(function () {
        const select = wrap.getElementsByTagName('select')[0]

        expect(select.selectedIndex).toBe(0)
        expect(select.value).toBe('errorrik')
        expect(wrap.getElementsByTagName('b')[0].title).toBe('errorrik')

        myComponent.dispose()
        document.body.removeChild(wrap)
        done()
    })
})
