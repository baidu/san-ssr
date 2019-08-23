it('for render object', function (done) {
    // [inject] init

    const erikHTML = 'erik-errorrik@gmail.com'
    const grayHTML = 'otakustay-otakustay@gmail.com'
    const leeHTML = 'leeight-leeight@gmail.com'

    const lis = wrap.getElementsByTagName('li')

    expect(lis.length).toBe(2)
    expect(lis[0].innerHTML === erikHTML || lis[0].innerHTML === grayHTML).toBeTruthy()
    expect(lis[1].innerHTML === erikHTML || lis[1].innerHTML === grayHTML).toBeTruthy()

    myComponent.data.set('persons.leeight', 'leeight@gmail.com')
    myComponent.nextTick(function () {
        const lis = wrap.getElementsByTagName('li')

        expect(lis.length).toBe(3)
        expect(lis[0].innerHTML === erikHTML || lis[0].innerHTML === grayHTML || lis[0].innerHTML === leeHTML).toBeTruthy()
        expect(lis[1].innerHTML === erikHTML || lis[1].innerHTML === grayHTML || lis[1].innerHTML === leeHTML).toBeTruthy()
        expect(lis[2].innerHTML === erikHTML || lis[2].innerHTML === grayHTML || lis[2].innerHTML === leeHTML).toBeTruthy()

        myComponent.data.set('persons.erik', null)
        myComponent.nextTick(function () {
            const lis = wrap.getElementsByTagName('li')

            expect(lis.length).toBe(2)
            expect(lis[0].innerHTML === grayHTML || lis[0].innerHTML === leeHTML).toBeTruthy()
            expect(lis[1].innerHTML === grayHTML || lis[1].innerHTML === leeHTML).toBeTruthy()

            myComponent.dispose()
            document.body.removeChild(wrap)
            done()
        })
    })
})
