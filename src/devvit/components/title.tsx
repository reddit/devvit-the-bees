import {Devvit} from '@devvit/public-api'
import {paletteBlack, paletteWhite} from '../../shared/theme.ts'

export type TitleProps = {children?: JSX.Children}

export function Title(props: Readonly<TitleProps>): JSX.Element {
  return (
    <zstack
      alignment='top center'
      backgroundColor={paletteWhite}
      borderColor={paletteBlack}
      width='100%'
      height='100%'
    >
      <vstack alignment='start' width='100%' padding='medium'>
        <image
          description='The Birds & The Bees'
          url='logo.png'
          imageWidth='600px'
          imageHeight='342px'
          resizeMode='scale-down'
        />
      </vstack>
      <vstack
        alignment='bottom end'
        padding='medium'
        width='100%'
        height='100%'
      >
        {props.children ?? null}
      </vstack>
    </zstack>
  )
}
