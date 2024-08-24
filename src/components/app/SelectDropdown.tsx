import React from "react";

export default function SelectDropdown() {
  return (
    <div>
      <select name="location" id="" className="p-4 border rounded-lg">
        <option className="text-gray-500 text-4xl" value="">
          Location of the waste
        </option>
        <optgroup label="England">
          <option value="bath-and-north-east-somerset">
            Bath and North East Somerset
          </option>
          <option value="bedford">Bedford</option>
          <option value="berkshire">Berkshire</option>
          <option value="blackburn-with-darwen">Blackburn with Darwen</option>
          <option value="blackpool">Blackpool</option>
          <option value="bournemouth">Bournemouth</option>
          <option value="brighton-&amp;-hove">Brighton &amp; Hove</option>
          <option value="bristol">Bristol</option>
          <option value="buckinghamshire">Buckinghamshire</option>
          <option value="cambridgeshire">Cambridgeshire</option>
          <option value="central-bedfordshire">Central Bedfordshire</option>
          <option value="cheshire-east">Cheshire East</option>
          <option value="cheshire-west-and-chester">
            Cheshire West and Chester
          </option>
          <option value="cornwall">Cornwall</option>
          <option value="cumbria">Cumbria</option>
          <option value="darlington">Darlington</option>
          <option value="derby">Derby</option>
          <option value="derbyshire">Derbyshire</option>
          <option value="devon">Devon</option>
          <option value="dorset">Dorset</option>
          <option value="durham">Durham</option>
          <option value="east-riding-of-yorkshire">
            East Riding of Yorkshire
          </option>
          <option value="east-sussex">East Sussex</option>
          <option value="essex">Essex</option>
          <option value="gloucestershire">Gloucestershire</option>
          <option value="greater-london">Greater London</option>
          <option value="greater-manchester">Greater Manchester</option>
          <option value="halton">Halton</option>
          <option value="hampshire">Hampshire</option>
          <option value="hartlepool">Hartlepool</option>
          <option value="herefordshire">Herefordshire</option>
          <option value="hertfordshire">Hertfordshire</option>
          <option value="isle-of-wight">Isle of Wight</option>
          <option value="kent">Kent</option>
          <option value="kingston-upon-hull">Kingston upon Hull</option>
          <option value="lancashire">Lancashire</option>
          <option value="leicester">Leicester</option>
          <option value="leicestershire">Leicestershire</option>
          <option value="lincolnshire">Lincolnshire</option>
          <option value="luton">Luton</option>
          <option value="medway">Medway</option>
          <option value="merseyside">Merseyside</option>
          <option value="middlesbrough">Middlesbrough</option>
          <option value="milton-keynes">Milton Keynes</option>
          <option value="norfolk">Norfolk</option>
          <option value="north-east-lincolnshire">
            North East Lincolnshire
          </option>
          <option value="north-lincolnshire">North Lincolnshire</option>
          <option value="north-somerset">North Somerset</option>
          <option value="north-yorkshire">North Yorkshire</option>
          <option value="northamptonshire">Northamptonshire</option>
          <option value="northumberland">Northumberland</option>
          <option value="nottingham">Nottingham</option>
          <option value="nottinghamshire">Nottinghamshire</option>
          <option value="oxfordshire">Oxfordshire</option>
          <option value="peterborough">Peterborough</option>
          <option value="plymouth">Plymouth</option>
          <option value="poole">Poole</option>
          <option value="portsmouth">Portsmouth</option>
          <option value="redcar-and-cleveland">Redcar and Cleveland</option>
          <option value="rutland">Rutland</option>
          <option value="shropshire">Shropshire</option>
          <option value="somerset">Somerset</option>
          <option value="south-gloucestershire">South Gloucestershire</option>
          <option value="south-yorkshire">South Yorkshire</option>
          <option value="southampton">Southampton</option>
          <option value="southend-on-sea">Southend-on-Sea</option>
          <option value="staffordshire">Staffordshire</option>
          <option value="stockton-on-tees">Stockton-on-Tees</option>
          <option value="stoke-on-trent">Stoke-on-Trent</option>
          <option value="suffolk">Suffolk</option>
          <option value="surrey">Surrey</option>
          <option value="swindon">Swindon</option>
          <option value="telford-and-wrekin">Telford and Wrekin</option>
          <option value="thurrock">Thurrock</option>
          <option value="torbay">Torbay</option>
          <option value="tyne-and-wear">Tyne and Wear</option>
          <option value="warrington">Warrington</option>
          <option value="warwickshire">Warwickshire</option>
          <option value="west-midlands">West Midlands</option>
          <option value="west-sussex">West Sussex</option>
          <option value="west-yorkshire">West Yorkshire</option>
          <option value="wiltshire">Wiltshire</option>
          <option value="worcestershire">Worcestershire</option>
          <option value="york">York</option>
        </optgroup>
        <optgroup label="Scotland">
          <option value="aberdeen">Aberdeen</option>
          <option value="aberdeenshire">Aberdeenshire</option>
          <option value="angus">Angus</option>
          <option value="argyll-and-bute">Argyll and Bute</option>
          <option value="ayrshire-and-arran">Ayrshire and Arran</option>
          <option value="banffshire">Banffshire</option>
          <option value="berwickshire">Berwickshire</option>
          <option value="caithness">Caithness</option>
          <option value="clackmannanshire">Clackmannanshire</option>
          <option value="dumfries">Dumfries</option>
          <option value="dunbartonshire">Dunbartonshire</option>
          <option value="dundee">Dundee</option>
          <option value="east-lothian">East Lothian</option>
          <option value="edinburgh">Edinburgh</option>
          <option value="fife">Fife</option>
          <option value="glasgow">Glasgow</option>
          <option value="inverness">Inverness</option>
          <option value="kincardineshire">Kincardineshire</option>
          <option value="lanarkshire">Lanarkshire</option>
          <option value="midlothian">Midlothian</option>
          <option value="moray">Moray</option>
          <option value="nairn">Nairn</option>
          <option value="orkney-islands">Orkney Islands</option>
          <option value="perth-and-kinross">Perth and Kinross</option>
          <option value="renfrewshire">Renfrewshire</option>
          <option value="ross-and-cromarty">Ross and Cromarty</option>
          <option value="roxburgh,-ettrick-and-lauderdale">
            Roxburgh, Ettrick and Lauderdale
          </option>
          <option value="shetland-islands">Shetland Islands</option>
          <option value="stirling-and-falkirk">Stirling and Falkirk</option>
          <option value="sutherland">Sutherland</option>
          <option value="the-stewartry-of-kirkcudbright">
            The Stewartry of Kirkcudbright
          </option>
          <option value="tweeddale">Tweeddale</option>
          <option value="west-lothian">West Lothian</option>
          <option value="western-isles">Western Isles</option>
          <option value="wigtown">Wigtown</option>
        </optgroup>
        <optgroup label="Wales">
          <option value="blaenau-gwent">Blaenau Gwent</option>
          <option value="bridgend">Bridgend</option>
          <option value="caerphilly">Caerphilly</option>
          <option value="cardiff">Cardiff</option>
          <option value="carmarthenshire">Carmarthenshire</option>
          <option value="ceredigion">Ceredigion</option>
          <option value="conwy">Conwy</option>
          <option value="denbighshire">Denbighshire</option>
          <option value="flintshire">Flintshire</option>
          <option value="gwynedd">gwynedd</option>
          <option value="isle-of-anglesey">Isle of Anglesey</option>
          <option value="merthyr-tydfil">Merthyr Tydfil</option>
          <option value="monmouthshire">Monmouthshire</option>
          <option value="neath-port-talbot">Neath Port Talbot</option>
          <option value="newport">Newport</option>
          <option value="pembrokeshire">Pembrokeshire</option>
          <option value="powys">Powys</option>
          <option value="rhondda-cynon-taf">Rhondda Cynon Taf</option>
          <option value="swansea">Swansea</option>
          <option value="torfaen">Torfaen</option>
          <option value="vale-of-glamorgan">Vale of Glamorgan</option>
          <option value="wrexham">Wrexham</option>
        </optgroup>
        <optgroup label="Northern Ireland">
          <option value="antrim">Antrim</option>
          <option value="ards">Ards</option>
          <option value="armagh">Armagh</option>
          <option value="ballymena">Ballymena</option>
          <option value="ballymoney">Ballymoney</option>
          <option value="banbridge">Banbridge</option>
          <option value="belfast">Belfast</option>
          <option value="carrickfergus">Carrickfergus</option>
          <option value="castlereagh">Castlereagh</option>
          <option value="coleraine">Coleraine</option>
          <option value="cookstown">Cookstown</option>
          <option value="craigavon">Craigavon</option>
          <option value="derry">Derry</option>
          <option value="down">Down</option>
          <option value="dungannon-and-south-tyrone">
            Dungannon and South Tyrone
          </option>
          <option value="fermanagh">Fermanagh</option>
          <option value="larne">Larne</option>
          <option value="limavady">Limavady</option>
          <option value="lisburn">Lisburn</option>
          <option value="magherafelt">Magherafelt</option>
          <option value="moyle">Moyle</option>
          <option value="newry-and-mourne">Newry and Mourne</option>
          <option value="newtownabbey">Newtownabbey</option>
          <option value="north-down">North Down</option>
          <option value="omagh">Omagh</option>
          <option value="strabane">Strabane</option>
        </optgroup>
        <optgroup label="Ireland">
          <option value="carlow">Carlow</option>
          <option value="cavan">Cavan</option>
          <option value="clare">Clare</option>
          <option value="cork">Cork</option>
          <option value="donegal">Donegal</option>
          <option value="dublin">Dublin</option>
          <option value="dun-laoghaire-rathdown">Dún Laoghaire-Rathdown</option>
          <option value="fingal">Fingal</option>
          <option value="galway">Galway</option>
          <option value="kerry">Kerry</option>
          <option value="kildare">Kildare</option>
          <option value="kilkenny">Kilkenny</option>
          <option value="laois">Laois</option>
          <option value="leitrim">Leitrim</option>
          <option value="limerick">Limerick</option>
          <option value="longford">Longford</option>
          <option value="louth">Louth</option>
          <option value="mayo">Mayo</option>
          <option value="meath">Meath</option>
          <option value="monaghan">Monaghan</option>
          <option value="offaly">Offaly</option>
          <option value="roscommon">Roscommon</option>
          <option value="sligo">Sligo</option>
          <option value="south-dublin">South Dublin</option>
          <option value="tipperary">Tipperary</option>
          <option value="waterford">Waterford</option>
          <option value="westmeath">Westmeath</option>
          <option value="wexford">Wexford</option>
          <option value="wicklow">Wicklow</option>
        </optgroup>
      </select>
    </div>
  );
}
