export function expiry_reminder_templates() {
	const reminder_template_pppoe =
		'Dear {{name}} your wifi package of Ksh {{amount}} per month will expire on {{date}}, please make arrangements to renew.';
	const reminder_template_hotspot =
		'Dear {{name}} your wifi package of Ksh {{amount}} will expire on {{date}}.';

	return { reminder_template_pppoe, reminder_template_hotspot };
}

export function new_user_welcome_templates() {
	const welcome_template_pppoe =
		'Dear {{name}}, welcome to Accessnet Wifi. Use the following details to login to your wifi:\nPassword: {{wifi_password}}\n\nUse the following details to login to your Accessnet account to manage your wifi password:\nusername: {{account_username}}\npassword: {{account_password}}\nURL: https://test.com/account\n\nFeel free to change the passwords after login.';

	const welcome_template_hotspot =
		'Dear {{name}}, welcome to Accessnet Wifi. Use the following details to login to your wifi:\nPassword: {{wifi_password}}';

	return { welcome_template_pppoe, welcome_template_hotspot };
}

export function other_sms_templates() {
	const payment_details_template =
		'Dear {{name}} use the following details to pay for your wifi:\npaybill: 45345\naccount_number: {{account_number}}';

	const account_credentials_template =
		'Dear {{name}} use the following details to login to your Accessnet account to manage your wifi password:\nusername: {{username}}\nURL: https://test.com/account\n\nIf you have forgotten your password, click the forgot password link to reset.';

	const wifi_credentials_template =
		'Dear {{name}} use the following details to login to your wifi:\nPassword: {{wifi_password}}\n\nYou can change the password at https://test.com/account using the following details:\nusername: {{username}}';

	return {
		payment_details_template,
		account_credentials_template,
		wifi_credentials_template,
	};
}

export function payment_confirmation_templates() {
	const confirmation_template_pppoe =
		'Dear {{name}} your payment of Ksh {{amount}} for {{account_number}} has been recieved and will be credited to your account.';

	const confirmation_template_hotspot =
		'Dear {{name}} your payment of Ksh {{amount}} has been recieved and will be credited yo your account.';

	return { confirmation_template_pppoe, confirmation_template_hotspot };
}
