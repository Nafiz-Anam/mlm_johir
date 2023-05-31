const errCode = {
  401: "Unauthorized",
  403: "Forbidden",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  429: "Too Many Requests",
  1001: "Invalid API Key",
  1002: "Invalid Access Token",
  1003: "Invalid Credentials / Invalid Username or Password",
  1004: "Incorrect Input Format / Validation Error",
  1005: "Login Blocked",
  1006: "Registration Blocked",
  1007: "Invalid Sponsor Username",
  1008: "Position Not Usable / Position Already Filled",
  1009: "Invalid Placement",
  1010: "Username Not Available / Username Already Exists",
  1011: "Invalid Username / Username Not Found",
  1012: "Product Not Available",
  1013: "Incorrect Date Format",
  1014: "Insufficient USDT-wallet Balance",
  1015: "Incorrect Transaction Password",
  1016: "Invalid E-pin Code",
  1017: "fileTypeNotSupported",
  1018: "fileTypeExceeded",
  1019: "KYC Not Verified",
  1020: "Unsupported Protocol",
  1021: "Incorrect Password",
  1022: "Email Address Does Not Match Your Account",
  1023: "Invalid Address",
  1024: "errorInUpload",
  1025: "Insufficient Amount",
  1026: "Cart Is Empty",
  1027: "Requested payout amount is too low",
  1028: "Requested payout amount is too high",
  1029: "Multilanguage not enabled",
  1030: "Error occured! Please try again",
  1031: "Payout request sending failed",
  1032: "File not found",
  1033: "Invalid Leg Position",
  1034: "Registration Not Allowed",
  1035: "Invalid Sponsor Username",
  1036: "Invalid payment Method",
  1037: "E-mail Verification Required",
  1038: "Too Many Upload Limit",
  1039: "Invalid Transaction Details",
  1040: "Invalid Captcha",
  1041: "idAlreadyExist",
  1042: "Invalid Admin Username",
  1043: "Invalid User",
  1044: "E-pin purchase failed",
  1045: "E-pin request failed",
  1046: "E-pin transfer failed",
  1047: "Mail seinding failed",
  1048: "Invalid mail",
  1049: "Invalid payment type",
  1050: "Invalid Product",
  1051: "Invalid Id",
  1052: "Must Be Alteast one",
  1053: "Must Be An Integer",
  1054: "Repurchase failed",
  1055: "Duplicate E-pin",
  1056: "Invalid Board",
  1057: "Permission Denied",
  1058: "No Sufficient Referrals",
  1059: "Donation Sending Failed",
  1060: "Unable To Send Invitation",
  1061: "Invalid Lead",
  1062: "Email already exists",
  1063: "Failed To Update lead",
  1064: "Invalid OTP",
  1065: "Visitor ID not found",
  1066: "Lead details not found",
  1067: "Invalid request",
  1068: "OTP expired",
  1069: "OTP verification failed",
  1070: "Invalid Username",
  1072: "Same User",
  1073: "A payment is already in progress.",
  1074: "A wallet address has already been created.",
  1075: "Some Error Occured.",
  1076: "Please update your wallwt address in profile to payout.",
  1077: "Payout request failed..",
  1078: "Wallet address updated in profile is Invalid..",
};

export async function successMessage(req) {
  if (req.message) {
    var results = {
      status: true,
      data: {
        status: true,
        message: req.message,
      },
    };
  } else if (req.code) {
    var results = {
      status: true,
      code: req.code,
    };
  } else {
    var results = {
      status: true,
      data: req.value,
    };
  }
  return results;
}

export async function errorMessage(req) {
  const error = {
    code: req.code,
    description: errCode[`${req.code}`],
  };
  const results = {
    status: false,
    error: error,
  };
  return results;
}
