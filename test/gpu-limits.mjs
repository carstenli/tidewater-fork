// Plain-node tests of the adapter requirement check (no GPU): which limits reject an adapter.
import { missingLimits, REQUIRED_LIMITS, GPUUnsupportedError } from '../src/engine/gpu/GPU.js';

let fails = 0;
const ok = ( c, msg ) => {

	if ( ! c ) { fails ++; console.log( 'FAIL', msg ); } else console.log( 'ok  ', msg );

};

// WebGPU default limits (SwiftShader, many integrated / mobile GPUs)
const defaults = { maxSampledTexturesPerShaderStage: 16, maxStorageTexturesPerShaderStage: 4 };
const m = missingLimits( defaults );
ok( m.length === 2, 'default limits: both texture limits reported' );
ok( m.every( ( x ) => x.have < x.need && REQUIRED_LIMITS[ x.name ].min === x.need ), 'default limits: have / need filled in' );

// a typical desktop adapter
ok( missingLimits( { maxSampledTexturesPerShaderStage: 48, maxStorageTexturesPerShaderStage: 8 } ).length === 0, 'desktop limits pass' );
ok( missingLimits( { maxSampledTexturesPerShaderStage: 48, maxStorageTexturesPerShaderStage: 4 } ).map( ( x ) => x.name ).join() === 'maxStorageTexturesPerShaderStage', 'one short limit reported alone' );
// an implementation that does not report a limit is not rejected for it
ok( missingLimits( {} ).length === 0, 'unreported limits are not rejected' );

const e = new GPUUnsupportedError( 'x', m );
ok( e instanceof Error && e.name === 'GPUUnsupportedError' && e.missing === m, 'error carries the missing limits' );

if ( fails ) {

	console.log( fails + ' failed' );
	process.exit( 1 );

}

console.log( 'all passed' );
