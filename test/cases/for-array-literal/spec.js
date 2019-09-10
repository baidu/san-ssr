
it('for array literal', function (done) {
    // [inject] init

    const lis = wrap.getElementsByTagName('li')

    expect(lis.length).toBe(3)
    expect(lis[2].innerHTML).toBe('3')

    myComponent.data.set('three', 33)
    myComponent.data.set('other', [44, 55])
    myComponent.nextTick(function () {
        const lis = wrap.getElementsByTagName('li')

        expect(lis.length).toBe(5)
        expect(lis[2].innerHTML).toBe('33')
        expect(lis[3].innerHTML).toBe('44')
        expect(lis[4].innerHTML).toBe('55')

        myComponent.dispose()
        document.body.removeChild(wrap)
        done()
    })
})
