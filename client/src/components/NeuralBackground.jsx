import React from 'react';

const NeuralBackground = () => {
	return (
		<div
			className="fixed inset-0 z-[-5] pointer-events-none"
			style={{
				backgroundImage: 'none'
			}}
		/>
	);
};

export default NeuralBackground;