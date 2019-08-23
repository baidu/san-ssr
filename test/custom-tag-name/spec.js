it('custom tag name', function () {
    const ieVersionMatch = typeof navigator !== 'undefined' &&
        navigator.userAgent.match(/msie\s*([0-9]+)/i)

    /**
     * ie版本号，非ie时为0
     *
     * @type {number}
     */
    const ie = ieVersionMatch ? ieVersionMatch[1] - 0 : 0

    const el = document.getElementById('custom-tag-name')
    expect(el.getElementsByTagName('x-p').length).toBe(1)

    if (!ie || ie > 8) {
    // [inject] init

        expect(el.getElementsByTagName('x-p')[0].innerHTML).toContain('hello san')

        myComponent.dispose()
    }

    document.body.removeChild(el)
})
