import React from 'react';

const sampleAvatars = [
    'sample1.png',
    'sample2.png',
    'sample3.png',
    'sample4.png'
];

const AvatarPicker = ({ selectedAvatar, setSelectedAvatar }) => {
    const baseUrl = 'https://cricket-backend-uswr.onrender.com/sample_avatars/';

    return (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <h3>🧍‍♂️ Choose Your Avatar</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {sampleAvatars.map((filename, index) => {
                    const avatarUrl = `${baseUrl}${filename}`;
                    return (
                        <img
                            key={index}
                            src={avatarUrl}
                            alt={`avatar-${index + 1}`}
                            onClick={() => setSelectedAvatar(avatarUrl)}
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                border: selectedAvatar === avatarUrl ? '3px solid green' : '2px solid #ccc',
                                cursor: 'pointer'
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default AvatarPicker;
