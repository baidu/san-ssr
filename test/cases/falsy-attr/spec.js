it('bool attr twoway binding, falsy attr', function () {
    // [inject] init

    expect(wrap.getElementsByTagName('div')[0].getAttribute('a3')).toBe('false')
})
