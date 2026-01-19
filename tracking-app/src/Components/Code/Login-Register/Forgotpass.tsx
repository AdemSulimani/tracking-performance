import { useState } from 'react';
import '../../Style/Login style/Forgotpass.css';

export function Forgotpass() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle forgot password logic here
        console.log('Email:', email);
    };

    return (

  <div className="forgotpass-container">
            <div className="forgotpass-form-wrapper">
                <h2 className="forgotpass-title">Forgot your password</h2>
                
                <form className="forgotpass-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="forgotpass-button">
                        Send
                    </button>
                </form>

                <p className="forgotpass-info">
                    We will send you the instructions on how to reset the password in this email
                </p>
            </div>
        </div>
      
    );
}
