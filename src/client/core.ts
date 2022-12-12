

export enum EShader {
	Basic = 0,
	Phong,
	Tabla,
	Top,
	Last
}

export enum EUniform {
	Info = 0,
	Mv,
	Mvp,
	PieceTexture,
	Projection,
	NormalTexture,
	Flip,
	Color,
	ColorSat
}

export enum EShaderMode {
	Basic = 'basic',
	Dem = 'dem',
	Multi = 'multi',
	Phong = 'phong',
}

export interface ICamera {
	position: [number, number, number]
}

export interface IShader {
	vertex: string
	fragment: string
}

export enum EKeyId {
	ArrowLeft = 'left',
	ArrowRight = 'right',
	ArrowUp = 'up',
	ArrowDown = 'down',
	ZoomIn = 'in',
	ZoomOut = 'out',
}

export interface IKeyAction {
	id: EKeyId
	timestamp: number;
	acceleration: number;
	velocity: number
}
