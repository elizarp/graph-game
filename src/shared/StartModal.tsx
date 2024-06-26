import { Button, Dialog, TextInput, Banner } from '@neo4j-ndl/react';
import { useState } from 'react';
import { execQuery, setDriver } from './utils/Driver';

interface Message {
  type: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  content: string;
}

interface StartModalProps {
  open: boolean;
  setOpenStart: (arg: boolean) => void;
  getUserName: (arg: string) => void;
  message?: Message;
}

export default function StartModal({
  open,
  setOpenStart,
  getUserName,
  message,
}: StartModalProps) {
  const [userName, setUserName] = useState<string>('');
  const [userCompany, setUserCompany] = useState<string>('');
  const [userEmail, setuserEmail] = useState<string>('');

  const [startMessage, setMessage] = useState<Message | null>(null);

  //const [isLoading, setIsLoading] = useState<boolean>(false);


  function submitStart() {
    try {


      let isSuccessful = (userName && userCompany && userEmail);
      if (!isSuccessful){
        setMessage({
          type: 'danger',
          content: 'Please type your data!',
        });
        return;
      }

      const { uri, user, password } = JSON.parse(localStorage.getItem('neo4j-connection') ?? '') ?? {};
      setDriver(uri, user, password);

      // Call the runRecoQuery function with a query string
      (async () => {
        const query = `MERGE (p:Person {id:'${userName}'}) SET p.name = '${userName}', p.email = '${userEmail}', p.company = '${userCompany}', p.level = 0  RETURN p`;
        const results = await execQuery(query);
        if (results) {
          localStorage.setItem('userName', userName);
        } else {
          console.error('Failed to retrieve results.');
        }
      })();
      getUserName(userName);
      isSuccessful
        ? setOpenStart(false)
        : setMessage({
          type: 'danger',
          content: 'Connection failed, please check the developer console logs for more informations',
        });
    } catch (error) {
      setMessage({
        type: 'danger',
        content: 'Connection failed, please check the developer console logs for more informations',
      });
    }
  }

  function userClose(){
    setOpenStart(false);
  }
  return (
    <>
      <Dialog size='small' open={open} aria-labelledby='form-dialog-title' onClose={userClose}>
        <Dialog.Header id='form-dialog-title'>User Data</Dialog.Header>
        <Dialog.Content className='n-flex n-flex-col n-gap-token-4'>
          {message && <Banner type={message.type}>{message.content}</Banner>}
          {startMessage && <Banner type={startMessage.type}>{startMessage.content}</Banner>}

          <div className='n-flex n-flex-row n-flex-wrap mb-2'>
            <div className='w-[100%] mr-1.5 inline-block'>
              <TextInput
                id='userName'
                value={userName}
                disabled={false}
                label='Name'
                placeholder='<type your name>'
                fluid
                required
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className='w-[100%%] mr-1.5 inline-block'>
              <TextInput
                id='userCompany'
                value={userCompany}
                disabled={false}
                label='Company'
                placeholder='<type your company>'
                fluid
                required
                onChange={(e) => setUserCompany(e.target.value)}
              />
            </div>
            <div className='w-[100%] mr-1.5 inline-block'>
              <TextInput
                id='userEmail'
                value={userEmail}
                disabled={false}
                label='Email'
                type='email'
                placeholder='<type your email>'
                fluid
                required
                onChange={(e) => setuserEmail(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => submitStart()}>Submit</Button>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
