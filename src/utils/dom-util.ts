export const autoCloseTags = new Set(
    'area,base,br,col,embed,hr,img,input,keygen,param,source,track,wbr'.split(',')
)

export const booleanAttributes = new Set(
    (
        'allowpaymentrequest,async,autofocus,autoplay,' +
        'checked,controls,default,defer,disabled,formnovalidate,' +
        'hidden,ismap,itemscope,loop,multiple,muted,nomodule,novalidate,' +
        'open,readonly,required,reversed,selected,typemustmatch'
    ).split(',')
)
