it('method', function () {
    // [inject] init

    const b = wrap.getElementsByTagName('b')[0]

    expect(b.title).toBe('real1')
})
